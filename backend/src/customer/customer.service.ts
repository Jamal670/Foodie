import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { Customer } from './entity/customer.entity';
import { MenuCategoryService } from 'src/menu/menu-category/menu-category.service';
import { MenuItemsService } from 'src/menu/menu-items/menu-items/menu-items.service';
import { ResturantService } from 'src/resturants/resturant/resturant.service';
import { BranchService } from 'src/resturants/branch/branch.service';

import { TableService } from 'src/table-module/table/table.service';
import { TableSectionService } from 'src/table-module/table-section/table-section.service';
import { ScanQrInput } from './dto/scan-qr.dto';
import { CustomerScanResponse } from './dto/response/customer-scan-response.dto';
import {
  ProductDetailsDto,
  ProductDetailsResponse,
} from './dto/product-details.dto';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { TableStatus } from 'src/table-module/table/entity/enums/enums';
import { Table } from 'src/table-module/table/entity/table.entity';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

export interface ValidatedCustomerContext {
  customer: Customer;
  session: TableSession;
  table: Table;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly menuCategoryService: MenuCategoryService,
    private readonly menuItemsService: MenuItemsService,
    private readonly resturantService: ResturantService,
    private readonly branchService: BranchService,
    private readonly tableService: TableService,
    private readonly tableSectionService: TableSectionService,
    private readonly dataSource: DataSource,
  ) { }

  // ==================== scanQrCode (public orchestrator) ====================
  async scanQrCode(
    input: ScanQrInput,
    userAgent?: string,
    accessToken?: string,
    deviceId?: string,
  ): Promise<CustomerScanResponse> {
    const cleanToken =
      accessToken &&
        typeof accessToken === 'string' &&
        accessToken.trim() !== '' &&
        accessToken.trim() !== 'undefined' &&
        accessToken.trim() !== 'null'
        ? accessToken.trim()
        : undefined;

    // 1. If Access Token is present -> Existing Customer Flow (HARD FAILURE on invalid token)
    if (cleanToken) {
      const verifiedContext = await this.validateCustomerToken(cleanToken);

      // Validate QR code table matches verified context table
      const table = await this.validateTable(input.qrToken);
      if (!table || table.id !== verifiedContext.table.id) {
        throw new BadRequestException('Table QR code does not match session.');
      }

      const menuData = await this.loadRestaurantMenu(table.restaurantId, table.branchId);
      return this.buildResponse(
        cleanToken,
        verifiedContext.session,
        table,
        menuData.branch,
        menuData.restaurant,
        menuData.categories,
        menuData.menuItems,
      );
    }

    // 2. New Scan / No Token Flow
    const effectiveDeviceId = input.deviceId || deviceId;
    const {
      table,
      session,
      accessToken: finalAccessToken,
    } = await this.executeNewScanFlow(input.qrToken, userAgent, effectiveDeviceId);

    const menuData = await this.loadRestaurantMenu(table.restaurantId, table.branchId);

    return this.buildResponse(
      finalAccessToken,
      session,
      table,
      menuData.branch,
      menuData.restaurant,
      menuData.categories,
      menuData.menuItems,
    );
  }

  // ==================== Section 13: Unified Authentication Core ====================
  async validateCustomerToken(
    accessToken: string,
    entityManager?: EntityManager,
  ): Promise<ValidatedCustomerContext> {
    let payload: any;
    try {
      const secret = this.configService.get<string>('CUSTOMER_ACCESS_TOKEN');
      payload = this.jwtService.verify(accessToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired customer token.');
    }

    if (!payload || !payload.customerId || !payload.sessionId) {
      throw new UnauthorizedException('Invalid token payload structure.');
    }

    const customerRepo = entityManager
      ? entityManager.getRepository(Customer)
      : this.customerRepository;

    const customer = await customerRepo.findOne({
      where: { id: payload.customerId, sessionId: payload.sessionId },
    });

    if (!customer || !customer.isActive || !customer.token) {
      throw new UnauthorizedException(
        'Customer account is inactive or not found.',
      );
    }

    const isMatch = await bcrypt.compare(accessToken, customer.token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid or expired customer token.');
    }

    const sessionRepo = entityManager
      ? entityManager.getRepository(TableSession)
      : this.dataSource.getRepository(TableSession);

    const session = await sessionRepo.findOne({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Dining session is inactive or closed.');
    }

    const isExpired = session.expiresAt && new Date() > session.expiresAt;
    if (isExpired) {
      throw new UnauthorizedException('Dining session has expired. Please rescan the QR code to continue.');
    }

    if (
      session.tableId !== payload.tableId ||
      session.restaurantId !== payload.restaurantId ||
      session.branchId !== payload.branchId ||
      (customer.tableId !== undefined && customer.tableId !== payload.tableId) ||
      (customer.branchId !== undefined && customer.branchId !== payload.branchId) ||
      (customer.sessionId !== undefined && customer.sessionId !== payload.sessionId)
    ) {
      throw new UnauthorizedException('Session context mismatch.');
    }

    const tableRepo = entityManager
      ? entityManager.getRepository(Table)
      : this.dataSource.getRepository(Table);

    const table = await tableRepo.findOne({ where: { id: session.tableId } });
    if (!table) {
      throw new UnauthorizedException('Table not found.');
    }

    if (table.status === TableStatus.OUT_OF_SERVICE) {
      throw new BadRequestException('Table is out of service.');
    }

    return { customer, session, table };
  }

  // ==================== Private New Scan Flow (Section 9) ====================
  private async executeNewScanFlow(
    qrToken: string,
    userAgent?: string,
    deviceId?: string,
  ): Promise<{
    table: Table;
    session: TableSession;
    customer: Customer;
    accessToken: string;
  }> {
    const table = await this.validateTable(qrToken);
    if (!table) {
      throw new NotFoundException('Table not found or invalid QR code.');
    }

    if (table.status === TableStatus.OUT_OF_SERVICE) {
      throw new BadRequestException('Table is out of service.');
    }

    // Step 1: Short DB Transaction (NO bcrypt inside transaction)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let session: TableSession;
    let customer: Customer | undefined;

    try {
      const entityManager = queryRunner.manager;

      // Find or create active table session (handles Postgres 23505 race condition)
      const sessionResult =
        await this.tableSectionService.findOrCreateSession(
          table.id,
          table.restaurantId,
          table.branchId,
          userAgent,
          entityManager,
        );
      session = sessionResult.session;

      if (sessionResult.isNew && table.status === TableStatus.AVAILABLE) {
        table.status = TableStatus.OCCUPIED;
        await entityManager.save(table);
      }

      // Section 14 Device Dedup check
      if (deviceId) {
        const existingCustomer = await entityManager
          .getRepository(Customer)
          .findOne({
            where: {
              sessionId: session.id,
              deviceId,
              isActive: true,
            },
          });
        if (existingCustomer) {
          customer = existingCustomer;
        }
      }

      if (!customer) {
        // Create customer record initially inactive with null token
        const customerRepo = entityManager.getRepository(Customer);
        customer = customerRepo.create({
          sessionId: session.id,
          tableId: table.id,
          branchId: table.branchId,
          deviceId,
          isActive: false,
          token: undefined,
        });
        customer = await customerRepo.save(customer);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Step 2: Outside Transaction (JWT generation + bcrypt hash)
    const payload = {
      customerId: customer.id,
      sessionId: session.id,
      tableId: table.id,
      restaurantId: table.restaurantId,
      branchId: table.branchId,
    };
    const secret = this.configService.get<string>('CUSTOMER_ACCESS_TOKEN');
    const rawAccessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '2h',
    });

    const saltValue = this.tableSectionService.getSaltValue();
    const hashedToken = await bcrypt.hash(rawAccessToken, saltValue);

    // Step 3: Fast Update to activate customer with hashed token
    customer.token = hashedToken;
    customer.isActive = true;
    await this.customerRepository.save(customer);

    return {
      table,
      session,
      customer,
      accessToken: rawAccessToken,
    };
  }


  // ==================== validateTable ====================
  private async validateTable(
    qrToken: string,
    entityManager?: EntityManager,
  ): Promise<Table> {
    return this.tableService.validateQrToken(qrToken, entityManager);
  }

  // ==================== loadRestaurantMenu ====================
  private async loadRestaurantMenu(restaurantId: number, branchId: number) {
    const [categories, restaurant, branch, menuItems] = await Promise.all([
      this.menuCategoryService.getMenuCategoriesTree(restaurantId),
      this.resturantService.findResturantById(restaurantId),
      this.branchService.findBranchById(branchId),
      this.menuItemsService.getMenuItems(restaurantId),
    ]);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return {
      restaurant,
      branch,
      categories,
      menuItems,
    };
  }

  // ==================== buildResponse ====================
  private buildResponse(
    accessToken: string,
    session: TableSession,
    table: Table,
    branch: Branch,
    restaurant: Restaurant,
    categories: MenuCategory[],
    menuItems: MenuItem[],
  ): CustomerScanResponse {
    return {
      accessToken,
      session,
      table,
      branch,
      restaurant,
      categories,
      menuItems,
    };
  }

  // ==================== getProductDetails ====================
  async getProductDetailById(
    dto: ProductDetailsDto,
    restaurantId: number,
  ): Promise<ProductDetailsResponse> {
    const menuItem = await this.menuItemsService.getMenuItem(
      dto.menuItemId,
      restaurantId,
    );

    if (!menuItem) {
      throw new NotFoundException('Menu item not found.');
    }

    if (menuItem.restaurantId !== restaurantId) {
      throw new NotFoundException('Menu item not found.');
    }

    const variations = (await menuItem.variations) || [];
    const customizations = (await menuItem.customizations) || [];
    const addons = (await menuItem.addons) || [];

    return {
      variations,
      customizations,
      addons,
    };
  }
}


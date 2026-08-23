import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Customer } from './entity/customer.entity';
import { MenuCategoryService } from 'src/menu/menu-category/menu-category.service';
import { MenuItemsService } from 'src/menu/menu-items/menu-items/menu-items.service';
import { ResturantService } from 'src/resturants/resturant/resturant.service';

import { TableService } from 'src/table-module/table/table.service';
import { TableSectionService } from 'src/table-module/table-section/table-section.service';
import { ScanQrInput } from './dto/scan-qr.dto';
import { CustomerScanResponse } from './dto/customer-scan-response.dto';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { TableStatus } from 'src/table-module/table/entity/enums/enums';
import { Table } from 'src/table-module/table/entity/table.entity';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

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
    private readonly tableService: TableService,
    private readonly tableSectionService: TableSectionService,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== scanQrCode (public orchestrator) ====================
  async scanQrCode(
    input: ScanQrInput,
    userAgent?: string,
    accessToken?: string,
  ): Promise<CustomerScanResponse> {
    const {
      table,
      session,
      accessToken: finalAccessToken,
    } = await this.executeTransaction(input.qrToken, userAgent, accessToken);

    const menuData = await this.loadRestaurantMenu(table.restaurantId);

    return this.buildResponse(
      finalAccessToken,
      session,
      menuData.restaurant,
      menuData.categories,
      menuData.menuItems,
    );
  }

  //*-*-*-*-*-*-*-*-*-*-* Private Functions *-*-*-*-*-*-*-*-*-*-*
  // ==================== executeTransaction ====================
  private async executeTransaction(
    qrToken: string,
    userAgent?: string,
    accessToken?: string,
  ): Promise<{
    table: Table;
    session: TableSession;
    customer: Customer;
    accessToken: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // 1. Check for Access Token (Case B)
      if (accessToken) {
        try {
          const verified = await this.tableSectionService.verifySessionToken(
            accessToken,
            entityManager,
          );
          if (verified) {
            // Validate table QR token again first
            const table = await this.validateTable(qrToken);
            if (!table) {
              throw new NotFoundException(
                'Table not found or invalid QR code.',
              );
            }

            if (table.status === TableStatus.OUT_OF_SERVICE) {
              throw new BadRequestException('Table is out of service.');
            }

            // Target extra verification
            if (
              table.id !== verified.tableId ||
              table.restaurantId !== verified.restaurantId ||
              table.branchId !== verified.branchId
            ) {
              throw new BadRequestException('Invalid table session context.');
            }

            // Find customer record associated with this session
            let customer = await entityManager.getRepository(Customer).findOne({
              where: { sessionId: verified.session.id },
            });

            // Fallback: in case customer was deleted/not found, create one
            if (!customer) {
              customer = await this.createCustomerRecord(
                verified.session.id,
                table.id,
                table.branchId,
                entityManager,
              );
            }

            await queryRunner.commitTransaction();
            return {
              table,
              session: verified.session,
              customer,
              accessToken,
            };
          }
        } catch {
          // If Token is Invalid: Continue with normal QR scan flow
        }
      }

      // 2. Case A / Normal Flow
      // validateTable()
      const table = await this.validateTable(qrToken);

      if (!table) {
        throw new NotFoundException('Table not found or invalid QR code.');
      }

      const {
        session,
        customer,
        accessToken: newAccessToken,
      } = await (async () => {
        switch (table.status) {
          case TableStatus.AVAILABLE:
            return this.handleAvailableTable(table, userAgent, entityManager);
          case TableStatus.OCCUPIED:
          case TableStatus.RESERVED:
          case TableStatus.CLEANING:
            return this.handleSharedSessionTable(
              table,
              userAgent,
              entityManager,
            );
          case TableStatus.OUT_OF_SERVICE:
            return this.handleOutOfServiceTable();
          default:
            return this.handleSharedSessionTable(
              table,
              userAgent,
              entityManager,
            );
        }
      })();

      await queryRunner.commitTransaction();
      return { table, session, customer, accessToken: newAccessToken };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== Table Status Handlers ====================

  private async handleAvailableTable(
    table: Table,
    userAgent: string | undefined,
    entityManager: EntityManager,
  ): Promise<{
    session: TableSession;
    customer: Customer;
    accessToken: string;
  }> {
    const { session, isNew } = await this.findOrCreateSession(
      table,
      userAgent,
      entityManager,
    );

    const customer = await this.createCustomerRecord(
      session.id,
      table.id,
      table.branchId,
      entityManager,
    );

    if (isNew) {
      await this.updateTableStatus(table, entityManager);
    }

    const accessToken =
      await this.tableSectionService.registerCustomerConnection(
        customer,
        session,
        table.restaurantId,
        table.branchId,
        table.id,
        entityManager,
      );

    return { session, customer, accessToken };
  }

  private async handleSharedSessionTable(
    table: Table,
    userAgent: string | undefined,
    entityManager: EntityManager,
  ): Promise<{
    session: TableSession;
    customer: Customer;
    accessToken: string;
  }> {
    const { session } = await this.findOrCreateSession(
      table,
      userAgent,
      entityManager,
    );

    const customer = await this.createCustomerRecord(
      session.id,
      table.id,
      table.branchId,
      entityManager,
    );

    const accessToken =
      await this.tableSectionService.registerCustomerConnection(
        customer,
        session,
        table.restaurantId,
        table.branchId,
        table.id,
        entityManager,
      );

    return { session, customer, accessToken };
  }

  private handleOutOfServiceTable(): never {
    throw new BadRequestException('Table is out of service.');
  }

  // ==================== validateTable ====================
  private async validateTable(
    qrToken: string,
    entityManager?: EntityManager,
  ): Promise<Table> {
    return this.tableService.validateQrToken(qrToken, entityManager);
  }

  // ==================== findOrCreateSession ====================
  private async findOrCreateSession(
    table: Table,
    userAgent: string | undefined,
    entityManager: EntityManager,
  ): Promise<{ session: TableSession; isNew: boolean }> {
    return this.tableSectionService.findOrCreateSession(
      table.id,
      table.restaurantId,
      table.branchId,
      userAgent,
      entityManager,
    );
  }

  // ==================== createCustomerRecord ====================
  private async createCustomerRecord(
    sessionId: number,
    tableId: number,
    branchId: number,
    entityManager: EntityManager,
  ): Promise<Customer> {
    const repo = entityManager.getRepository(Customer);
    const newCustomer = repo.create({
      sessionId,
      tableId,
      branchId,
    });
    return await repo.save(newCustomer);
  }

  // ==================== updateTableStatus ====================
  private async updateTableStatus(
    table: Table,
    entityManager: EntityManager,
  ): Promise<void> {
    table.status = TableStatus.OCCUPIED;
    await entityManager.save(table);
  }

  // ==================== loadRestaurantMenu ====================
  private async loadRestaurantMenu(restaurantId: number) {
    const [categories, menuItems, restaurant] = await Promise.all([
      this.menuCategoryService.getCategories(restaurantId),
      this.menuItemsService.getMenuItems(restaurantId),
      this.resturantService.findResturantById(restaurantId),
    ]);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return {
      restaurant,
      categories,
      menuItems,
    };
  }

  // ==================== buildResponse ====================
  private buildResponse(
    accessToken: string,
    session: TableSession,
    restaurant: Restaurant,
    categories: MenuCategory[],
    menuItems: MenuItem[],
  ): CustomerScanResponse {
    return {
      accessToken,
      session,
      restaurant,
      categories,
      menuItems,
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { CustomerResolver } from './customer.resolver';
import { CustomerService } from './customer.service';
import { TableService } from 'src/table-module/table/table.service';
import { TableSectionService } from 'src/table-module/table-section/table-section.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { MenuCategoryService } from 'src/menu/menu-category/menu-category.service';
import { MenuItemsService } from 'src/menu/menu-items/menu-items/menu-items.service';
import { ResturantService } from 'src/resturants/resturant/resturant.service';
import { BranchService } from 'src/resturants/branch/branch.service';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TableStatus, QrType } from 'src/table-module/table/entity/enums/enums';
import { CustomerJwtAuthGuard } from 'src/auth/guards/customer-jwt-auth.guard';
import * as bcrypt from 'bcrypt';

describe('Customer Architecture & Auth Refactor', () => {
  let resolver: CustomerResolver;
  let service: CustomerService;
  let tableService: TableService;
  let tableSectionService: TableSectionService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let menuCategoryService: MenuCategoryService;
  let menuItemsService: MenuItemsService;
  let resturantService: ResturantService;
  let branchService: BranchService;

  const mockCustomerRecord = {
    id: 101,
    tableId: 5,
    branchId: 3,
    sessionId: 7,
    isActive: true,
    token: '$2b$10$hashedtoken',
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
      getRepository: jest.fn().mockImplementation(() => ({
        create: jest.fn().mockImplementation((val) => ({ id: 101, ...val })),
        save: jest
          .fn()
          .mockImplementation((val) => Promise.resolve({ id: 101, ...val })),
        findOne: jest.fn(),
      })),
    },
  };

  const mockSessionRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTableRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCustomerRepository = {
    create: jest.fn().mockImplementation((val) => ({ id: 101, ...val })),
    save: jest.fn().mockImplementation((val) => Promise.resolve({ id: 101, ...val })),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity.name === 'TableSession') return mockSessionRepo;
      if (entity.name === 'Table') return mockTableRepo;
      return mockCustomerRepository;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerResolver,
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: TableService,
          useValue: {
            validateQrToken: jest.fn(),
          },
        },
        {
          provide: TableSectionService,
          useValue: {
            findOrCreateSession: jest.fn(),
            getSaltValue: jest.fn().mockReturnValue(10),
          },
        },
        {
          provide: MenuCategoryService,
          useValue: {
            getMenuCategoriesTree: jest.fn(),
          },
        },
        {
          provide: MenuItemsService,
          useValue: {
            getMenuItems: jest.fn(),
            getMenuItem: jest.fn(),
          },
        },
        {
          provide: ResturantService,
          useValue: {
            findResturantById: jest.fn(),
          },
        },
        {
          provide: BranchService,
          useValue: {
            findBranchById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('valid_raw_jwt_token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock_customer_secret'),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    resolver = module.get<CustomerResolver>(CustomerResolver);
    service = module.get<CustomerService>(CustomerService);
    tableService = module.get<TableService>(TableService);
    tableSectionService = module.get<TableSectionService>(TableSectionService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    menuCategoryService = module.get<MenuCategoryService>(MenuCategoryService);
    menuItemsService = module.get<MenuItemsService>(MenuItemsService);
    resturantService = module.get<ResturantService>(ResturantService);
    branchService = module.get<BranchService>(BranchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CustomerResolver', () => {
    it('should delegate scanQrCode mutation to CustomerService', async () => {
      const input = { qrToken: 'token_123' };
      const expectedResponse = { accessToken: 'token' } as any;
      jest.spyOn(service, 'scanQrCode').mockResolvedValue(expectedResponse);

      const result = await resolver.scanQrCode(input, {
        req: { headers: { 'user-agent': 'mock_agent' } },
      });
      expect(service.scanQrCode).toHaveBeenCalledWith(
        input,
        'mock_agent',
        undefined,
        undefined,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('Section 22 Expectations & Architectural Tests', () => {
    it('1. Concurrent QR scans: race-safe recovery on unique violation (code 23505)', async () => {
      const mockRepo = {
        findOne: jest.fn(),
        create: jest.fn().mockReturnValue({ tableId: 5, isActive: true }),
        save: jest
          .fn()
          .mockRejectedValueOnce({ code: '23505', message: 'UQ_one_active_session_per_table' }),
      };

      const tableSectionSvc = new TableSectionService(
        mockRepo as any,
        configService,
      );

      // Second findOne after race error returns existing active session
      const existingSession = { id: 7, tableId: 5, isActive: true };
      mockRepo.findOne
        .mockResolvedValueOnce(null) // first check
        .mockResolvedValueOnce(existingSession); // re-fetch after 23505 race

      const result = await tableSectionSvc.findOrCreateSession(5, 1, 3);
      expect(result).toEqual({ session: existingSession, isNew: false });
    });

    it('2. Multiple customers (A and B) under same TableSession remain independently valid', async () => {
      const mockTable = { id: 5, restaurantId: 1, branchId: 3, status: TableStatus.OCCUPIED };
      const mockSession = { id: 7, tableId: 5, restaurantId: 1, branchId: 3, isActive: true };
      const mockCustomerA = { id: 101, sessionId: 7, tableId: 5, branchId: 3, isActive: true, token: await bcrypt.hash('tokenA', 10) };
      const mockCustomerB = { id: 102, sessionId: 7, tableId: 5, branchId: 3, isActive: true, token: await bcrypt.hash('tokenB', 10) };

      jest.spyOn(jwtService, 'verify').mockImplementation((token: string) => {
        if (token === 'tokenA') return { customerId: 101, sessionId: 7, tableId: 5, restaurantId: 1, branchId: 3 };
        if (token === 'tokenB') return { customerId: 102, sessionId: 7, tableId: 5, restaurantId: 1, branchId: 3 };
        throw new Error('Invalid token');
      });

      mockCustomerRepository.findOne.mockImplementation(({ where }: any) => {
        if (where.id === 101) return Promise.resolve(mockCustomerA);
        if (where.id === 102) return Promise.resolve(mockCustomerB);
        return Promise.resolve(null);
      });

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockTableRepo.findOne.mockResolvedValue(mockTable);

      // Validate Customer A
      const ctxA = await service.validateCustomerToken('tokenA');
      expect(ctxA.customer.id).toBe(101);

      // Validate Customer B
      const ctxB = await service.validateCustomerToken('tokenB');
      expect(ctxB.customer.id).toBe(102);

      // Both belong to session 7
      expect(ctxA.session.id).toBe(7);
      expect(ctxB.session.id).toBe(7);
    });

    it('3. Invalid or expired token throws UnauthorizedException (HARD FAILURE, no fallback)', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.scanQrCode({ qrToken: 'valid_table_qr' }, 'agent', 'expired_token'),
      ).rejects.toThrow(UnauthorizedException);

      // Ensure findOrCreateSession was NOT called (no fallback customer creation!)
      expect(tableSectionService.findOrCreateSession).not.toHaveBeenCalled();
    });

    it('4. Token validation rejects token whose customerId belongs to a different session or table', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        customerId: 101,
        sessionId: 7,
        tableId: 99, // Mismatched tableId in payload
        restaurantId: 1,
        branchId: 3,
      });

      const mockCustomer = { id: 101, sessionId: 7, isActive: true, token: await bcrypt.hash('token123', 10) };
      const mockSession = { id: 7, tableId: 5, restaurantId: 1, branchId: 3, isActive: true }; // session tableId is 5, payload has 99

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockSessionRepo.findOne.mockResolvedValue(mockSession);

      await expect(service.validateCustomerToken('token123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('5. Two-step transaction flow: isActive=false / token=null customer is rejected', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        customerId: 101,
        sessionId: 7,
        tableId: 5,
        restaurantId: 1,
        branchId: 3,
      });

      // Half-created customer (isActive = false, token = null)
      const inactiveCustomer = { id: 101, sessionId: 7, isActive: false, token: null };
      mockCustomerRepository.findOne.mockResolvedValue(inactiveCustomer);

      await expect(service.validateCustomerToken('some_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('6. First-time customer with missing, undefined, null, or empty string token executes new scan flow without validating token', async () => {
      const mockTable = { id: 5, restaurantId: 1, branchId: 3, status: TableStatus.AVAILABLE };
      const mockSession = { id: 7, tableId: 5, restaurantId: 1, branchId: 3, isActive: true };

      jest.spyOn(tableService, 'validateQrToken').mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'findOrCreateSession').mockResolvedValue({
        session: mockSession as any,
        isNew: true,
      });
      jest.spyOn(menuCategoryService, 'getMenuCategoriesTree').mockResolvedValue([]);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue([]);
      jest.spyOn(resturantService, 'findResturantById').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(branchService, 'findBranchById').mockResolvedValue({ id: 3 } as any);

      const validateSpy = jest.spyOn(service, 'validateCustomerToken');

      // Test with undefined, "undefined", "null", and empty whitespace
      const tokensToTest = [undefined, '', '   ', 'undefined', 'null'];

      for (const token of tokensToTest) {
        validateSpy.mockClear();
        const response = await service.scanQrCode(
          { qrToken: 'valid_qr_123' },
          'User-Agent-Mock',
          token,
        );

        expect(validateSpy).not.toHaveBeenCalled();
        expect(response.accessToken).toBe('valid_raw_jwt_token');
        expect(response.session.id).toBe(7);
      }
    });

    it('7. scanQrCode returns strictly hierarchical categories (Level 1 root) and menuItems with images', async () => {
      const mockTable = { id: 5, restaurantId: 1, branchId: 3, status: TableStatus.AVAILABLE };
      const mockSession = { id: 7, tableId: 5, restaurantId: 1, branchId: 3, isActive: true };

      const mockTree = [
        {
          id: 10,
          name: 'Main Dishes',
          level: 1,
          parentCategoryId: null,
          children: [
            {
              id: 36,
              name: 'Soups',
              level: 2,
              parentCategoryId: 10,
              children: [
                {
                  id: 37,
                  name: 'Spicy Soups',
                  level: 3,
                  parentCategoryId: 36,
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      const mockMenuItems = [
        { id: 1, name: 'Tomato Soup', images: [{ id: 1, imageUrl: 'http://img.jpg' }] },
      ];

      jest.spyOn(tableService, 'validateQrToken').mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'findOrCreateSession').mockResolvedValue({
        session: mockSession as any,
        isNew: true,
      });
      jest.spyOn(menuCategoryService, 'getMenuCategoriesTree').mockResolvedValue(mockTree as any);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue(mockMenuItems as any);
      jest.spyOn(resturantService, 'findResturantById').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(branchService, 'findBranchById').mockResolvedValue({ id: 3 } as any);

      const response = await service.scanQrCode({ qrToken: 'valid_qr_123' }, 'User-Agent-Mock');

      // Top level categories array must contain only root categories (id 10)
      expect(response.categories).toHaveLength(1);
      expect(response.categories[0].id).toBe(10);
      expect((response.categories[0] as any).children[0].id).toBe(36);
      expect((response.categories[0] as any).children[0].children[0].id).toBe(37);

      // IDs 36 and 37 MUST NOT be top-level categories
      expect(response.categories.find((c) => c.id === 36)).toBeUndefined();
      expect(response.categories.find((c) => c.id === 37)).toBeUndefined();

      // table and branch should exist on response
      expect(response.table.id).toBe(5);
      expect(response.branch.id).toBe(3);

      // menuItems with images should exist on response
      expect(response.menuItems).toEqual(mockMenuItems);
    });

    describe('getProductDetails & CustomerJwtAuthGuard', () => {
      it('should delegate getProductDetails mutation in CustomerResolver to CustomerService with session.restaurantId', async () => {
        const dto = { menuItemId: 50 };
        const mockSession = { id: 7, restaurantId: 1 } as any;
        const expectedResponse = {
          images: [{ id: 1, imageUrl: 'img.jpg' }],
          variations: [],
          customizations: [],
          addons: [],
        } as any;
        jest.spyOn(service, 'getProductDetailById').mockResolvedValue(expectedResponse);

        const result = await resolver.getProductDetailById(dto, mockSession);

        expect(service.getProductDetailById).toHaveBeenCalledWith(dto, 1);
        expect(result).toBe(expectedResponse);
      });

      it('should validate customer token and attach context in CustomerJwtAuthGuard', async () => {
        const guard = new CustomerJwtAuthGuard(service);
        const mockReq = {
          headers: { authorization: 'Bearer valid_token' },
        };
        const mockContext = {
          getType: () => 'graphql',
          getHandler: jest.fn(),
          getClass: jest.fn(),
          getArgs: jest.fn().mockReturnValue([{}, {}, { req: mockReq }, {}]),
        } as any;

        jest.spyOn(service, 'validateCustomerToken').mockResolvedValue({
          customer: mockCustomerRecord as any,
          session: { id: 7, restaurantId: 1 } as any,
          table: { id: 5 } as any,
        });

        const canActivate = await guard.canActivate(mockContext);

        expect(canActivate).toBe(true);
        expect(service.validateCustomerToken).toHaveBeenCalledWith('valid_token');
        expect((mockReq as any).currentCustomer).toEqual(mockCustomerRecord);
        expect((mockReq as any).currentSession).toEqual({ id: 7, restaurantId: 1 });
      });

      it('should throw UnauthorizedException with rescan QR message in CustomerJwtAuthGuard on missing or invalid token', async () => {
        const guard = new CustomerJwtAuthGuard(service);
        const mockReq = { headers: {} };
        const mockContext = {
          getType: () => 'graphql',
          getHandler: jest.fn(),
          getClass: jest.fn(),
          getArgs: jest.fn().mockReturnValue([{}, {}, { req: mockReq }, {}]),
        } as any;

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should return exactly images, variations, customizations, addons for a valid item in CustomerService', async () => {
        const mockItem = {
          id: 50,
          restaurantId: 1,
          images: Promise.resolve([{ id: 1, imageUrl: 'img.jpg' }]),
          variations: Promise.resolve([{ id: 2, name: 'Large', price: 10 }]),
          customizations: Promise.resolve([]),
          addons: Promise.resolve([]),
        };

        jest.spyOn(menuItemsService, 'getMenuItem').mockResolvedValue(mockItem as any);

        const res = await service.getProductDetailById({ menuItemId: 50 }, 1);

        expect(res).toEqual({
          images: [{ id: 1, imageUrl: 'img.jpg' }],
          variations: [{ id: 2, name: 'Large', price: 10 }],
          customizations: [],
          addons: [],
        });
      });

      it('should throw NotFoundException if getMenuItem fails or item belongs to a different restaurant', async () => {
        jest.spyOn(menuItemsService, 'getMenuItem').mockImplementation(() => {
          throw new NotFoundException('Menu item not found.');
        });

        await expect(
          service.getProductDetailById({ menuItemId: 50 }, 1),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});



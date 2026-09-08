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
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TableStatus, QrType } from 'src/table-module/table/entity/enums/enums';
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
            getCategories: jest.fn(),
          },
        },
        {
          provide: MenuItemsService,
          useValue: {
            getMenuItems: jest.fn(),
          },
        },
        {
          provide: ResturantService,
          useValue: {
            findResturantById: jest.fn(),
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
      jest.spyOn(menuCategoryService, 'getCategories').mockResolvedValue([]);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue([]);
      jest.spyOn(resturantService, 'findResturantById').mockResolvedValue({ id: 1 } as any);

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
  });
});


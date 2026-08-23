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
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TableStatus, QrType } from 'src/table-module/table/entity/enums/enums';

describe('Customer QR Scan Module', () => {
  let resolver: CustomerResolver;
  let service: CustomerService;
  let tableService: TableService;
  let tableSectionService: TableSectionService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let menuCategoryService: MenuCategoryService;
  let menuItemsService: MenuItemsService;
  let resturantService: ResturantService;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      getRepository: jest.fn().mockImplementation(() => ({
        create: jest
          .fn()
          .mockReturnValue({ id: 55, name: 'Guest', tableId: 5, branchId: 3 }),
        save: jest.fn().mockResolvedValue({
          id: 55,
          name: 'Guest',
          tableId: 5,
          branchId: 3,
        }),
      })),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
            verifySessionToken: jest.fn(),
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
            sign: jest.fn().mockReturnValue('mocked_jwt_token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock_secret'),
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
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('CustomerService', () => {
    it('should orchestrate successful scan successfully', async () => {
      const qrToken = 'token_abc';
      const mockTable = {
        id: 5,
        restaurantId: 1,
        branchId: 3,
        qrToken,
        qrType: QrType.DINE_IN,
        status: TableStatus.AVAILABLE,
      };
      const mockSession = {
        id: 15,
        tableId: 5,
        token: 'session_xyz',
        isActive: true,
        expiresAt: new Date(),
      };
      const mockRestaurant = { id: 1, restName: 'Burger Hub' };
      const mockCategories = [{ id: 1, name: 'Burgers' }];
      const mockMenuItems = [{ id: 1, name: 'Beef Burger' }];

      jest
        .spyOn(tableService, 'validateQrToken')
        .mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'findOrCreateSession').mockResolvedValue({
        session: mockSession as any,
        isNew: true,
        accessToken: 'mocked_jwt_token',
      });
      jest
        .spyOn(menuCategoryService, 'getCategories')
        .mockResolvedValue(mockCategories as any);
      jest
        .spyOn(menuItemsService, 'getMenuItems')
        .mockResolvedValue(mockMenuItems as any);
      jest
        .spyOn(resturantService, 'findResturantById')
        .mockResolvedValue(mockRestaurant as any);

      const response = await service.scanQrCode({ qrToken }, 'mock_agent');

      // Check transaction flows
      expect(tableService.validateQrToken).toHaveBeenCalledWith(qrToken);
      expect(tableSectionService.findOrCreateSession).toHaveBeenCalledWith(
        5,
        1,
        3,
        'mock_agent',
        mockQueryRunner.manager,
      );
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, status: TableStatus.OCCUPIED }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();

      // Check Menu query parallelism
      expect(menuCategoryService.getCategories).toHaveBeenCalledWith(1);
      expect(menuItemsService.getMenuItems).toHaveBeenCalledWith(1);
      expect(resturantService.findResturantById).toHaveBeenCalledWith(1);

      // Check response mapping
      expect(response).toEqual({
        accessToken: 'mocked_jwt_token',
        session: mockSession,
        restaurant: mockRestaurant,
        categories: mockCategories,
        menuItems: mockMenuItems,
      });
    });

    it('should rollback transaction if repository operations fail', async () => {
      jest
        .spyOn(tableService, 'validateQrToken')
        .mockRejectedValue(new Error('Validate Failed'));

      await expect(service.scanQrCode({ qrToken: 'invalid' })).rejects.toThrow(
        'Validate Failed',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException if restaurant is not found when loading menu', async () => {
      const mockTable = { id: 5, restaurantId: 1, branchId: 3 };
      const mockSession = { id: 15 };

      jest
        .spyOn(tableService, 'validateQrToken')
        .mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'findOrCreateSession').mockResolvedValue({
        session: mockSession as any,
        isNew: false,
        accessToken: 'mocked_jwt_token',
      });
      jest.spyOn(menuCategoryService, 'getCategories').mockResolvedValue([]);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue([]);
      jest.spyOn(resturantService, 'findResturantById').mockResolvedValue(null);

      await expect(service.scanQrCode({ qrToken: 'token' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if table is OutOfService', async () => {
      const mockTable = {
        id: 5,
        restaurantId: 1,
        branchId: 3,
        status: TableStatus.OUT_OF_SERVICE,
      };
      jest
        .spyOn(tableService, 'validateQrToken')
        .mockResolvedValue(mockTable as any);

      await expect(service.scanQrCode({ qrToken: 'token' })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should not update status if table is Reserved', async () => {
      const mockTable = {
        id: 5,
        restaurantId: 1,
        branchId: 3,
        status: TableStatus.RESERVED,
      };
      const mockSession = { id: 15, isActive: true };
      const mockRestaurant = { id: 1 };

      jest
        .spyOn(tableService, 'validateQrToken')
        .mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'findOrCreateSession').mockResolvedValue({
        session: mockSession as any,
        isNew: true,
        accessToken: 'mocked_jwt_token',
      });
      jest.spyOn(menuCategoryService, 'getCategories').mockResolvedValue([]);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue([]);
      jest
        .spyOn(resturantService, 'findResturantById')
        .mockResolvedValue(mockRestaurant as any);

      await service.scanQrCode({ qrToken: 'token' });

      // Ensure save is not called on the table status update
      expect(mockQueryRunner.manager.save).not.toHaveBeenCalledWith(
        expect.objectContaining({ status: TableStatus.OCCUPIED }),
      );
    });

    it('should reuse existing session and skip customer creation and status updates if a valid accessToken is provided (Case B)', async () => {
      const mockTable = {
        id: 5,
        restaurantId: 1,
        branchId: 3,
        status: TableStatus.AVAILABLE,
      };
      const mockSession = { id: 15, isActive: true };
      const mockRestaurant = { id: 1 };
      const mockCustomer = { id: 55, sessionId: 15 };

      jest
        .spyOn(tableService, 'validateQrToken')
        .mockResolvedValue(mockTable as any);
      jest.spyOn(tableSectionService, 'verifySessionToken').mockResolvedValue({
        sessionId: 15,
        restaurantId: 1,
        branchId: 3,
        tableId: 5,
        session: mockSession as any,
      });

      // Stub save and findOne for EntityManager
      mockQueryRunner.manager.getRepository = jest
        .fn()
        .mockImplementation(() => ({
          findOne: jest.fn().mockResolvedValue(mockCustomer),
          create: jest.fn(),
          save: jest.fn(),
        }));

      jest.spyOn(menuCategoryService, 'getCategories').mockResolvedValue([]);
      jest.spyOn(menuItemsService, 'getMenuItems').mockResolvedValue([]);
      jest
        .spyOn(resturantService, 'findResturantById')
        .mockResolvedValue(mockRestaurant as any);

      const response = await service.scanQrCode(
        { qrToken: 'token' },
        'mock_agent',
        'valid_token',
      );

      // verifySessionToken should have been checked
      expect(tableSectionService.verifySessionToken).toHaveBeenCalledWith(
        'valid_token',
        mockQueryRunner.manager,
      );
      // findOrCreateSession should NOT have been called
      expect(tableSectionService.findOrCreateSession).not.toHaveBeenCalled();
      // No table status updates should have occurred
      expect(mockQueryRunner.manager.save).not.toHaveBeenCalledWith(
        expect.objectContaining({ status: TableStatus.OCCUPIED }),
      );

      expect(response.accessToken).toBe('valid_token');
    });
  });
});

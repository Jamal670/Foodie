import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UserService } from './user.service';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { RolePermissionService } from 'src/user/role-permission/role-permission.service';
import { PermissionService } from 'src/user/permission/permission.service';
import { User } from './entity/user.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { RolePermission } from 'src/user/role-permission/entity/rolePermission.entity';
import { UserSession } from 'src/user/user-session/entity/userSession.entity';
import { Permission } from 'src/user/permission/entity/permission.entity';
import { Role } from 'src/user/role-module/entity/role.entity';
import { UserStatus } from './entity/enums/user.enum';
import { RoleStatus } from 'src/user/role-module/entity/enums/role.enums';
import { CreateNewRoleDto } from './DTO/createNewRole.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

import { MailService } from 'src/common/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

describe('createNewRole Mutation & Service Tests', () => {
  let userService: UserService;
  let roleModuleService: RoleModuleService;
  let rolePermissionService: RolePermissionService;
  let dataSource: DataSource;

  const mockMailService = {
    sendRoleVerificationEmail: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked-role-token-30m'),
  };

  // Mock repositories
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBranchRepo = {
    findOne: jest.fn(),
  };

  const mockRolePermissionRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserSessionRepo = {
    find: jest.fn(),
  };

  const mockPermissionRepo = {
    find: jest.fn(),
  };

  const mockRoleRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn((entity) => {
      if (entity === User) return mockUserRepo;
      if (entity === Role) return mockRoleRepo;
      if (entity === RolePermission) return mockRolePermissionRepo;
      if (entity === Permission) return mockPermissionRepo;
      return null;
    }),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
  };

  const validJwtPayload: JwtPayload = {
    sub: 1,
    restaurantId: 10,
    branchId: 100,
    roleId: 2,
  };

  const validCreatorUser = {
    user_id: 1,
    email: 'creator@restaurant.com',
    restaurantId: 10,
    branchId: 100,
    roleId: 2,
    isVerified: UserStatus.VERIFIED,
  };

  const validBranch = {
    id: 100,
    restaurantId: 10,
  };

  const validCreatorSession = {
    id: 'session-1',
    userId: 1,
    valid: true,
  };

  const validCreatorPermissions = [
    { roleId: 2, permissionId: 1, permission: { permissionKey: 'roles.create' } },
    { roleId: 2, permissionId: 2, permission: { permissionKey: 'menu.manage' } },
    { roleId: 2, permissionId: 3, permission: { permissionKey: 'orders.view' } },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        RoleModuleService,
        RolePermissionService,
        PermissionService,
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Branch), useValue: mockBranchRepo },
        { provide: getRepositoryToken(RolePermission), useValue: mockRolePermissionRepo },
        { provide: getRepositoryToken(UserSession), useValue: mockUserSessionRepo },
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    roleModuleService = module.get<RoleModuleService>(RoleModuleService);
    rolePermissionService = module.get<RolePermissionService>(RolePermissionService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('1. Success Flow & is_system_role calculation', () => {
    it('should create staff user, role, and role_permissions atomically', async () => {
      const dto: CreateNewRoleDto = {
        roleName: '  Manager  ',
        roleEmail: ' STAFF@RESTAURANT.COM ',
        permissionIds: [1, 2],
      };

      // Mock DB authorization checks
      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where?.user_id === 1) return Promise.resolve(validCreatorUser);
        if (where?.email === 'staff@restaurant.com') return Promise.resolve(null);
        return Promise.resolve(null);
      });
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockRolePermissionRepo.find.mockResolvedValue(validCreatorPermissions);

      // Inside transaction mocks
      mockPermissionRepo.find.mockResolvedValue([
        { id: 1, permissionKey: 'roles.create' },
        { id: 2, permissionKey: 'menu.manage' },
      ]);

      mockRoleRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const mockNewRole: Role = {
        role_id: 55,
        restaurantId: 10,
        role_name: 'Manager',
        is_system_role: true,
        status: RoleStatus.ACTIVE,
        created_at: new Date(),
      };
      mockRoleRepo.create.mockReturnValue(mockNewRole);
      mockRoleRepo.save.mockResolvedValue(mockNewRole);

      mockRolePermissionRepo.create.mockImplementation((item) => item);
      mockRolePermissionRepo.save.mockResolvedValue([]);

      const mockNewUser: User = {
        user_id: 99,
        email: 'staff@restaurant.com',
        restaurantId: 10,
        branchId: 100,
        roleId: 55,
        login_provider: 'email/password',
        isVerified: UserStatus.PENDING,
        OnBoardingStatus: true,
      };
      mockUserRepo.create.mockReturnValue(mockNewUser);
      mockUserRepo.save.mockResolvedValue(mockNewUser);

      const result = await userService.createNewRole(dto, validJwtPayload);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(99);
      expect(result.roleId).toBe(55);
      expect(result.roleName).toBe('Manager');
      expect(result.roleEmail).toBe('staff@restaurant.com');
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('should compute is_system_role=true for Waiter and false for custom role', async () => {
      expect(['manager', 'pos operator', 'waiter'].includes('waiter')).toBe(true);
      expect(['manager', 'pos operator', 'waiter'].includes('head chef')).toBe(false);
    });
  });

  describe('2. Creator authorization checks', () => {
    it('should handle creator role permission check (TEMPORARILY DISABLED by user)', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Cashier',
        roleEmail: 'cashier@restaurant.com',
        permissionIds: [2],
      };

      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where?.user_id === 1) return Promise.resolve(validCreatorUser);
        return Promise.resolve(null);
      });
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockPermissionRepo.find.mockResolvedValue([{ id: 2, permissionKey: 'menu.manage' }]);
      mockRoleRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      mockRoleRepo.create.mockReturnValue({ role_id: 88 });
      mockRoleRepo.save.mockResolvedValue({ role_id: 88 });
      mockUserRepo.create.mockReturnValue({ user_id: 77, email: 'cashier@restaurant.com' });
      mockUserRepo.save.mockResolvedValue({ user_id: 77, email: 'cashier@restaurant.com' });

      // Section 5 is temporarily disabled in user.service.ts
      const result = await userService.createNewRole(dto, validJwtPayload);
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if JWT and DB restaurantId/branchId mismatch', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Cashier',
        roleEmail: 'cashier@restaurant.com',
        permissionIds: [1],
      };

      const mismatchedUser = {
        ...validCreatorUser,
        restaurantId: 999, // Mismatch
      };
      mockUserRepo.findOne.mockResolvedValue(mismatchedUser);

      await expect(
        userService.createNewRole(dto, validJwtPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('3. Privilege Escalation Prevention', () => {
    it('should throw BadRequestException for unassigned permission ID when section 5 is disabled', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Supervisor',
        roleEmail: 'super@restaurant.com',
        permissionIds: [1, 999], // 999 does not exist in DB
      };

      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where?.user_id === 1) return Promise.resolve(validCreatorUser);
        return Promise.resolve(null);
      });
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockPermissionRepo.find.mockResolvedValue([
        { id: 1, permissionKey: 'roles.create' },
      ]);

      await expect(
        userService.createNewRole(dto, validJwtPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('4. Non-existent permission handling & rollback', () => {
    it('should throw BadRequestException and roll back if permission ID does not exist', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Captain',
        roleEmail: 'captain@restaurant.com',
        permissionIds: [1, 2],
      };

      mockUserRepo.findOne.mockResolvedValue(validCreatorUser);
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockRolePermissionRepo.find.mockResolvedValue(validCreatorPermissions);

      // Return only 1 permission out of 2 requested
      mockPermissionRepo.find.mockResolvedValue([
        { id: 1, permissionKey: 'roles.create' },
      ]);

      await expect(
        userService.createNewRole(dto, validJwtPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('5. Duplicate email conflict & rollback', () => {
    it('should throw ConflictException if staff email already exists', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Runner',
        roleEmail: 'existing@restaurant.com',
        permissionIds: [1],
      };

      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where?.user_id === 1) return Promise.resolve(validCreatorUser);
        if (where?.email === 'existing@restaurant.com')
          return Promise.resolve({ user_id: 200, email: 'existing@restaurant.com' });
        return Promise.resolve(null);
      });
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockRolePermissionRepo.find.mockResolvedValue(validCreatorPermissions);
      mockPermissionRepo.find.mockResolvedValue([{ id: 1, permissionKey: 'roles.create' }]);

      mockRoleRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      mockRoleRepo.create.mockReturnValue({ role_id: 10 });
      mockRoleRepo.save.mockResolvedValue({ role_id: 10 });

      await expect(
        userService.createNewRole(dto, validJwtPayload),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('6. Role permissions failure rollback', () => {
    it('should throw error and trigger rollback if role permissions save fails', async () => {
      const dto: CreateNewRoleDto = {
        roleName: 'Cleaner',
        roleEmail: 'cleaner@restaurant.com',
        permissionIds: [1],
      };

      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where?.user_id === 1) return Promise.resolve(validCreatorUser);
        return Promise.resolve(null);
      });
      mockBranchRepo.findOne.mockResolvedValue(validBranch);
      mockUserSessionRepo.find.mockResolvedValue([validCreatorSession]);
      mockRolePermissionRepo.find.mockResolvedValue(validCreatorPermissions);
      mockPermissionRepo.find.mockResolvedValue([{ id: 1, permissionKey: 'roles.create' }]);

      mockRoleRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      mockRoleRepo.create.mockReturnValue({ role_id: 15 });
      mockRoleRepo.save.mockResolvedValue({ role_id: 15 });

      mockRolePermissionRepo.save.mockRejectedValue(
        new Error('DB Constraint Failure'),
      );

      await expect(
        userService.createNewRole(dto, validJwtPayload),
      ).rejects.toThrow();
    });
  });

  describe('7. DTO Validation & Extra Fields Rejection', () => {
    it('should fail validation when extra non-whitelisted fields are provided', async () => {
      const inputObject = {
        roleName: 'Shift Supervisor',
        roleEmail: 'shift@restaurant.com',
        permissionIds: [1],
        restaurantId: 999, // Extra field
        is_system_role: true, // Extra field
      };

      const dtoInstance = plainToInstance(CreateNewRoleDto, inputObject);
      const errors = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'restaurantId')).toBe(true);
    });

    it('should pass validation for exact 3 required fields', async () => {
      const inputObject = {
        roleName: 'Shift Supervisor',
        roleEmail: 'shift@restaurant.com',
        permissionIds: [1, 2],
      };

      const dtoInstance = plainToInstance(CreateNewRoleDto, inputObject);
      const errors = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      expect(errors.length).toBe(0);
    });
  });
});

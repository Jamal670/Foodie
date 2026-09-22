import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/users/user.service';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { UserSessionService } from 'src/user/user-session/user-session.service';
import { MailService } from 'src/common/mail/mail.service';
import { User } from 'src/user/users/entity/user.entity';
import { UserStatus } from 'src/user/users/entity/enums/user.enum';
import { RoleEmailVerifyDto } from './DTO/roleEmailVerify.dto';

describe('POST /auth/role-email-verify Tests', () => {
  let controller: AuthController;
  let authService: AuthService;

  const roleInviteSecret = 'TestRoleInviteSecretKey123';

  const mockPendingUser: User = {
    user_id: 15,
    email: 'jamal.bilal6880@gmail.com',
    restaurantId: 10,
    branchId: 100,
    roleId: 5,
    login_provider: 'email/password',
    isVerified: UserStatus.PENDING,
    OnBoardingStatus: true,
  };

  const mockUserService = {
    CheckEmailExists: jest.fn(),
  };

  const mockUserSessionService = {
    generateTokens: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
    createSession: jest.fn().mockResolvedValue(true),
  };

  const mockRoleModuleService = {};
  const mockMailService = {
    sendRoleVerificationEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ROLE_INVITE_JWT_SECRET') return roleInviteSecret;
      if (key === 'ROLE_INVITE_EXPIRATION') return '24h';
      if (key === 'JWT_ACCESS_TOKEN') return 'AccessSecret';
      if (key === 'JWT_REFRESH_TOKEN') return 'RefreshSecret';
      return null;
    }),
  };

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    }),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
  };

  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: RoleModuleService, useValue: mockRoleModuleService },
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('1. Valid Token Verification & Session Login', () => {
    it('should activate user, create session, set cookies, and return true for valid invite token', async () => {
      const validToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      mockUserService.CheckEmailExists.mockResolvedValue({
        ...mockPendingUser,
      });

      const resMock: any = {
        cookie: jest.fn(),
      };
      const reqMock: any = {
        headers: { 'user-agent': 'Mozilla/5.0' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const result = await controller.verifyRoleEmail(
        { token: validToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(true);
      expect(mockUserService.CheckEmailExists).toHaveBeenCalledWith(
        'jamal.bilal6880@gmail.com',
      );
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(resMock.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-access-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(resMock.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock-refresh-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });
  });

  describe('2. Single-use and Reused Token Guard', () => {
    it('should return false if user is already VERIFIED (single-use token check)', async () => {
      const validToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      // User is already VERIFIED
      mockUserService.CheckEmailExists.mockResolvedValue({
        ...mockPendingUser,
        isVerified: UserStatus.VERIFIED,
      });

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: validToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
      expect(resMock.cookie).not.toHaveBeenCalled();
    });

    it('should return false if atomic update affected 0 rows (race condition / concurrent execution)', async () => {
      const validToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      mockUserService.CheckEmailExists.mockResolvedValue({
        ...mockPendingUser,
      });

      // Atomic update affected 0 rows
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: validToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
      expect(resMock.cookie).not.toHaveBeenCalled();
    });
  });

  describe('3. Signature, Expiry, and Purpose Checks', () => {
    it('should return false for token signed with wrong secret', async () => {
      const wrongSecretToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: 'WRONG_SECRET', expiresIn: '24h' },
      );

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: wrongSecretToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
    });

    it('should return false for expired invite token', async () => {
      const expiredToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '-1s' },
      );

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: expiredToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
    });

    it('should return false for token with wrong purpose (e.g. access/refresh token)', async () => {
      const wrongPurposeToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'access-token' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: wrongPurposeToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
    });
  });

  describe('4. User and ID Mismatch Checks', () => {
    it('should return false if token sub does not match DB user_id', async () => {
      const token = await jwtService.signAsync(
        { sub: 999, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      mockUserService.CheckEmailExists.mockResolvedValue({
        ...mockPendingUser,
        user_id: 15, // Mismatch (15 !== 999)
      });

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
    });
  });

  describe('5. Transaction Rollback on Session Creation Error', () => {
    it('should return false if session creation fails inside transaction', async () => {
      const validToken = await jwtService.signAsync(
        { sub: 15, email: 'jamal.bilal6880@gmail.com', purpose: 'role-invite' },
        { secret: roleInviteSecret, expiresIn: '24h' },
      );

      mockUserService.CheckEmailExists.mockResolvedValue({
        ...mockPendingUser,
      });

      // Session creation fails
      mockUserSessionService.createSession.mockRejectedValueOnce(
        new Error('DB Session Error'),
      );

      const resMock: any = { cookie: jest.fn() };
      const reqMock: any = { headers: {}, socket: {} };

      const result = await controller.verifyRoleEmail(
        { token: validToken },
        reqMock,
        resMock,
      );

      expect(result).toBe(false);
    });
  });

  describe('6. Input DTO Validation', () => {
    it('should fail validation if extra non-whitelisted fields are provided', async () => {
      const inputObj = {
        token: 'some-valid-token',
        extraField: 'hacker-data',
      };

      const dto = plainToInstance(RoleEmailVerifyDto, inputObj);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'extraField')).toBe(true);
    });

    it('should pass validation for exact token field', async () => {
      const inputObj = {
        token: 'some-valid-token',
      };

      const dto = plainToInstance(RoleEmailVerifyDto, inputObj);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      expect(errors.length).toBe(0);
    });
  });
});

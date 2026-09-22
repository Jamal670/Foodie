import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, EntityManager } from 'typeorm';

import { User } from './entity/user.entity';
import { CreateUserDto } from './DTO/user.created.dto';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { RolePermissionService } from 'src/user/role-permission/role-permission.service';
import { PermissionService } from 'src/user/permission/permission.service';
import { UserStatus } from './entity/enums/user.enum';
import { RoleStatus } from 'src/user/role-module/entity/enums/role.enums';
import { CreateNewRoleDto } from './DTO/createNewRole.dto';
import { CreateNewRoleResponse } from './DTO/createNewRole.response';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { RolePermission } from 'src/user/role-permission/entity/rolePermission.entity';
import { UserSession } from 'src/user/user-session/entity/userSession.entity';
import { Permission } from 'src/user/permission/entity/permission.entity';
import { Role } from 'src/user/role-module/entity/role.entity';

import { MailService } from 'src/common/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly roleModuleService: RoleModuleService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly permissionService: PermissionService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,
  ) {}

  //========================== Find all users ================================
  async findAllUsers() {
    return this.userRepo.find();
  }

  // ========================= Check if email exists =========================
  async CheckEmailExists(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { email } });
  }

  // ========================= Find user by email WITH password (for login only) =========================
  async findUserByEmailForAuth(email: string): Promise<User | null> {
    return await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // ========================= update verification status =========================
  async updateVerificationStatus(userId: number, status: UserStatus) {
    if (!Object.values(UserStatus).includes(status)) {
      throw new BadRequestException('Invalid verification status');
    }

    const result = await this.userRepo.update(
      { user_id: userId },
      { isVerified: status },
    );

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Verification status updated successfully',
    };
  }

  // ========================= update restaurant & branch =========================
  async updateRestaurantAndBranchId(
    userId: string,
    restaurantId: number,
    branchId: number,
  ) {
    await this.userRepo.update(userId, {
      restaurantId: restaurantId,
      branchId: branchId,
    });
  }

  // ========================= update onboarding status =========================
  async updateOnBoardingStatus(userId: string, status: boolean) {
    await this.userRepo.update(userId, { OnBoardingStatus: status });
  }

  // ========================= Create new user =========================
  async CreateNewUser(dto: CreateUserDto): Promise<User> {
    try {
      //create New role
      const role = await this.roleModuleService.CreateNewUserRole();
      //create new user
      const newUser = this.userRepo.create({
        ...dto,
        roleId: role.role_id,
      });
      return await this.userRepo.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // ========================= Find user by id =========================
  async findUserById(userId: number) {
    return this.userRepo.findOneByOrFail({
      user_id: userId,
    });
  }

  // ========================= Verify user =========================
  async verifyUser(userId: number) {
    return this.userRepo.update(userId, { isVerified: UserStatus.VERIFIED });
  }

  // ========================= Token expired to inactive =========================
  async TokenExpiredToInactive(userId: number) {
    return this.userRepo.update(userId, { isVerified: UserStatus.INACTIVE });
  }

  // ========================= Update password =========================
  async updatePassword(userId: string, hashedPassword: string) {
    return this.userRepo.update(userId, {
      password: hashedPassword,
    });
  }

  // ========================= Create New Staff User with Role (Atomic) =========================
  async createNewRole(
    dto: CreateNewRoleDto,
    authPayload: JwtPayload,
  ): Promise<CreateNewRoleResponse> {
    if (
      !authPayload ||
      !authPayload.sub ||
      !authPayload.restaurantId ||
      !authPayload.branchId
    ) {
      throw new UnauthorizedException(
        'Invalid or incomplete authentication credentials in context',
      );
    }

    // 1. Creator exists and is active/verified
    const creator = await this.userRepo.findOne({
      where: { user_id: authPayload.sub },
    });

    if (!creator) {
      throw new UnauthorizedException('Authenticated user does not exist in DB');
    }

    if (creator.isVerified !== UserStatus.VERIFIED) {
      throw new ForbiddenException('Creator account is not verified/active');
    }

    // 2. DB restaurantId & branchId match JWT claims
    if (
      creator.restaurantId !== authPayload.restaurantId ||
      creator.branchId !== authPayload.branchId
    ) {
      throw new ForbiddenException(
        'Creator restaurant or branch ID mismatch between database and token',
      );
    }

    // Verify branch belongs to creator's restaurant
    const branch = await this.branchRepo.findOne({
      where: { id: authPayload.branchId },
    });

    if (!branch || branch.restaurantId !== authPayload.restaurantId) {
      throw new ForbiddenException(
        'Creator branch does not belong to creator restaurant',
      );
    }

    // 3. UserSession check: ensure creator session is valid / not revoked
    const activeSessions = await this.userSessionRepo.find({
      where: { userId: authPayload.sub, valid: true },
    });

    if (activeSessions.length === 0) {
      throw new UnauthorizedException('Creator session is invalid or has been revoked');
    }

    // 4. Reserved names check
    const normalizedRoleName = dto.roleName.trim().toLowerCase();
    const reservedNames = ['owner', 'admin', 'super admin', 'superadmin', 'super_admin'];
    if (reservedNames.includes(normalizedRoleName)) {
      throw new ForbiddenException(
        `Role name '${dto.roleName}' is reserved and cannot be created`,
      );
    }

    // 5. Creator's role permission check (TEMPORARILY DISABLED)
    // TODO: Re-enable before production. Checks that the creator's role has
    // 'roles.create' and that every requested permission is held by the creator (privilege escalation check).
    /*
    if (!creator.roleId) {
      throw new ForbiddenException('Creator has no role assigned');
    }

    const creatorRolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: creator.roleId },
    });

    const creatorPermissionIds = new Set(
      creatorRolePermissions.map((rp) => rp.permissionId),
    );

    const creatorPermissions =
      creatorPermissionIds.size > 0
        ? await this.permissionRepo.find({
            where: { id: In(Array.from(creatorPermissionIds)) },
          })
        : [];

    const creatorPermissionKeys = new Set(
      creatorPermissions.map((p) => p.permissionKey),
    );

    if (!creatorPermissionKeys.has('roles.create')) {
      throw new ForbiddenException(
        'Insufficient permissions: creator role lacks roles.create permission',
      );
    }

    // Privilege escalation check: every requested permissionId must be held by creator's role
    for (const requestedId of dto.permissionIds) {
      if (!creatorPermissionIds.has(requestedId)) {
        throw new ForbiddenException(
          `Privilege escalation error: requested permission ID ${requestedId} is not held by creator role`,
        );
      }
    }
    */

    let createdRole!: Role;
    let createdUser!: User;

    try {
      await this.dataSource.transaction(async (manager) => {
        // Step 1 inside transaction: Validate permissions exist in DB
        const uniquePermissionIds = Array.from(new Set(dto.permissionIds));
        const foundPermissions = await manager.getRepository(Permission).find({
          where: { id: In(uniquePermissionIds) },
        });

        if (foundPermissions.length !== uniquePermissionIds.length) {
          throw new BadRequestException('Invalid permission');
        }

        // Step 2 inside transaction: Create role via RoleModuleService
        createdRole = await this.roleModuleService.createRole(
          {
            role_name: dto.roleName,
            restaurantId: authPayload.restaurantId,
            status: RoleStatus.ACTIVE,
          },
          manager,
        );

        // Step 3 inside transaction: Create role_permissions via RolePermissionService
        await this.rolePermissionService.createRolePermissions(
          createdRole.role_id,
          uniquePermissionIds,
          manager,
        );

        // Step 4 inside transaction: Create staff user
        const userRepo = manager.getRepository(User);

        const existingUser = await userRepo.findOne({
          where: { email: dto.roleEmail },
        });

        if (existingUser) {
          throw new ConflictException('Email already exists');
        }

        const newUser = userRepo.create({
          email: dto.roleEmail,
          login_provider: 'email/password',
          isVerified: UserStatus.PENDING,
          OnBoardingStatus: true,
          restaurantId: authPayload.restaurantId,
          branchId: authPayload.branchId,
          roleId: createdRole.role_id,
        });

        createdUser = await userRepo.save(newUser);
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      if (error.code === '23505') {
        throw new ConflictException(
          'Conflict: A user or role with these details already exists',
        );
      }
      if (error.code === '23503') {
        throw new BadRequestException('Invalid foreign key reference');
      }

      this.logger.error(
        `Failed createNewRole for actor ${authPayload.sub}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while creating staff user with role',
      );
    }

    // Post-commit side effect: Send role invite verification email
    try {
      const secret =
        process.env.ROLE_INVITE_JWT_SECRET || 'RoleInviteSecretKey123';
      const expiresIn = process.env.ROLE_INVITE_EXPIRATION || '24h';

      const payload = {
        sub: createdUser.user_id,
        email: createdUser.email,
        purpose: 'role-invite',
      };

      const token = await this.jwtService.signAsync(payload, {
        secret,
        expiresIn: expiresIn as any,
      });

      await this.mailService.sendRoleVerificationEmail(createdUser.email, token);

      this.logger.log(
        `Role verification email (role-invite token) sent successfully to ${createdUser.email}`,
      );
    } catch (emailErr) {
      this.logger.error(
        `Failed to send role verification email to ${createdUser.email}: ${emailErr.message}`,
      );
    }

    // Audit log
    this.logger.log(
      `[AUDIT] Actor sub:${authPayload.sub} (restaurant:${authPayload.restaurantId}, branch:${authPayload.branchId}) created staff user:${createdUser.user_id} with role:${createdRole.role_id} (${createdRole.role_name})`,
    );

    return {
      success: true,
      message: 'Staff user and role created successfully',
      userId: createdUser.user_id,
      roleId: createdRole.role_id,
      roleName: createdRole.role_name,
      roleEmail: createdUser.email,
    };
  }
}

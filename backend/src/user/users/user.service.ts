import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entity/user.entity';
import { CreateUserDto } from './DTO/user.created.dto';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { UserStatus } from './entity/enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly roleModuleService: RoleModuleService,
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

  // ========================= if <session token is expired> =========================
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

  // ========================= if <session token is expired> =========================
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

  // ========================= if <session token is expired> =========================
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
}

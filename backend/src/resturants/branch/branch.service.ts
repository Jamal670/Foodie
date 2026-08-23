import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Branch } from './entity/branch.entity';
import { CreateBranchDto } from './DTO/createBranch.dto';
//services
import { UserService } from 'src/user/users/user.service';
import { ResturantService } from '../resturant/resturant.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly userService: UserService,
    private readonly resturantService: ResturantService,
  ) {}

  async createBranch(dto: CreateBranchDto, user: any) {
    try {
      // 1. Fetch Restaurant Data using user id from JWT sub
      const resturantData = await this.resturantService.findResturantById(
        user.sub,
      );
      if (!resturantData) {
        throw new NotFoundException('Restaurant not found');
      }

      // 2. Fetch User Record to check OnBoardingStatus
      const existingUser = await this.userService.findUserById(user.sub);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // 3. Handle Onboarding Logic (OnBoardingStatus === false)
      if (existingUser.OnBoardingStatus === false) {
        // Check if a branch already exists for this restaurant
        const existingBranch = await this.branchRepository.findOne({
          where: { restaurantId: resturantData.id },
        });

        if (existingBranch) {
          // Update the existing branch
          await this.branchRepository.update(existingBranch.id, { ...dto });
          return {
            message:
              'Branch information updated successfully during onboarding',
            branchId: existingBranch.id,
          };
        }
      }

      // 4. Create New Branch (Always for OnBoardingStatus === true, or if no branch exists during onboarding)
      const branch = this.branchRepository.create({
        ...dto,
        restaurantId: resturantData.id,
      });

      const savedBranch = await this.branchRepository.save(branch);
      console.log(savedBranch.id);
      console.log(resturantData.id);

      // Link branch to user (primary branch for onboarding)
      await this.userService.updateRestaurantAndBranchId(
        user.sub,
        resturantData.id,
        savedBranch.id,
      );

      return {
        message: 'Branch created successfully',
        branch: savedBranch,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === '23505') {
        throw new ConflictException(
          'Branch name already exists for this restaurant. Please choose a different name.',
        );
      }

      console.error('Create Branch Error:', error);
      throw new InternalServerErrorException(
        'Failed to process branch request',
      );
    }
  }
}

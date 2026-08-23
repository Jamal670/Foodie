import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './entity/resturant.entity';
import { CreateResturantDto } from './DTO/resturnat.dto';

import { UserService } from 'src/user/users/user.service';

@Injectable()
export class ResturantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly resturantRepository: Repository<Restaurant>,
    private readonly userService: UserService,
  ) {}

  //========================= Find resturant By userID =========================

  async findResturantById(restaurantId: number) {
    return this.resturantRepository.findOne({
      where: { id: restaurantId },
    });
  }

  //========================= Create Restaurant Info =========================

  async createRestaurantInfo(dto: CreateResturantDto, user: any) {
    try {
      const userData = await this.userService.findUserById(user.sub);

      if (!userData) {
        throw new NotFoundException('User not found');
      }

      // During onboarding, update existing restaurant
      if (userData.OnBoardingStatus === false) {
        const existingRestaurant = await this.resturantRepository.findOne({
          where: { id: userData.restaurantId },
        });

        if (existingRestaurant) {
          const updatedRestaurant = await this.resturantRepository.save(dto);

          return {
            message: 'Restaurant information updated successfully',
            data: updatedRestaurant,
          };
        }
      }

      const restaurant = this.resturantRepository.create(dto);

      return await this.resturantRepository.save(restaurant);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Restaurant name already exists. Please choose a different name.',
        );
      }

      console.error('Create Restaurant Error:', error);

      throw new InternalServerErrorException('Failed to create restaurant');
    }
  }
}

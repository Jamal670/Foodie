import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderType } from './entity/orderType.entity';
import { CreateOrderTypeDto } from './DTO/menuType.dto';
//services
import { ResturantService } from '../resturant/resturant.service';
import { UserService } from 'src/user/users/user.service';

@Injectable()
export class OrderTypeService {
  constructor(
    @InjectRepository(OrderType)
    private readonly orderTypeRepository: Repository<OrderType>,
    private readonly resturantService: ResturantService,
    private readonly userService: UserService,
  ) {}

  //========================= Create Order Type =========================
  async createOrderType(userId: number, dto: CreateOrderTypeDto) {
    try {
      // At least one order type must be enabled
      if (!dto.dineIn && !dto.delivery && !dto.takeaway) {
        throw new BadRequestException('Please enable at least one order type');
      }

      // Delivery validation
      if (
        dto.delivery === true &&
        (!dto.deliveryCharges || dto.deliveryCharges <= 0)
      ) {
        throw new BadRequestException(
          'Delivery charges are required when delivery is enabled',
        );
      }

      // Find restaurant
      const restaurant = await this.resturantService.findResturantById(userId);

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      // Common payload
      const payload = {
        dineIn: dto.dineIn ?? false,
        delivery: dto.delivery ?? false,
        takeaway: dto.takeaway ?? false,
        deliveryCharges: dto.deliveryCharges ?? 0,
      };

      // Check existing configuration
      const existingOrderType = await this.orderTypeRepository.findOne({
        where: {
          restaurantId: restaurant.id,
        },
        select: {
          id: true,
        },
      });

      // Update existing record
      if (existingOrderType) {
        await this.orderTypeRepository.update(existingOrderType.id, payload);

        await this.userService.updateOnBoardingStatus(String(userId), true);

        return {
          message: 'Order types updated successfully',
        };
      }

      // Create new record
      const savedOrderType = await this.orderTypeRepository.save(
        this.orderTypeRepository.create({
          restaurantId: restaurant.id,
          ...payload,
        }),
      );

      await this.userService.updateOnBoardingStatus(String(userId), true);

      return {
        message: 'Order types configured successfully',
        data: savedOrderType,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Create/Update Order Type Error:', error);

      throw new InternalServerErrorException('Failed to configure order types');
    }
  }
}

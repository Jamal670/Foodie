import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';

import { Table } from './entity/table.entity';
import { CreateTableDto } from './DTO/CreateTable.dto';
import { SuccessResponse } from 'src/common/DTOResponse/success-response.dto';
import { QrType } from './entity/enums/enums';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  //================== Create Tables ==================
  async createTables(
    dto: CreateTableDto,
    restaurantId: number,
    branchId: number,
  ): Promise<SuccessResponse> {
    const existingTable = await this.tableRepository.exist({
      where: {
        restaurantId,
        branchId,
        qrType: QrType.DINE_IN,
      },
    });

    if (existingTable) {
      throw new ConflictException(
        'QR codes have already been generated for this branch.',
      );
    }

    const tables = Array.from({ length: dto.tableNumber }, (_, index) => ({
      restaurantId,
      branchId,
      tableNumber: index + 1,
      qrToken: randomUUID(),
      qrType: QrType.DINE_IN,
    }));

    await this.tableRepository.insert(tables);

    return {
      success: true,
      message: `${dto.tableNumber} QR codes generated successfully.`,
    };
  }

  //================== Create Takeaway ==================
  async createTakeawayQr(
    restaurantId: number,
    branchId: number,
  ): Promise<SuccessResponse> {
    const alreadyExists = await this.tableRepository.exist({
      where: {
        restaurantId,
        branchId,
        qrType: QrType.TAKEAWAY,
      },
    });

    if (alreadyExists) {
      throw new ConflictException(
        'Takeaway QR code has already been generated for this branch.',
      );
    }

    await this.tableRepository.insert({
      restaurantId,
      branchId,
      tableNumber: 0,
      qrToken: randomUUID(),
      qrType: QrType.TAKEAWAY,
    });

    return {
      success: true,
      message: 'Takeaway QR code generated successfully.',
    };
  }

  //================== Get All Tables ==================
  async getAllTables(restaurantId: number, branchId: number): Promise<Table[]> {
    const tables = await this.tableRepository.find({
      where: {
        restaurantId,
        branchId,
      },
      order: {
        tableNumber: 'ASC',
      },
    });

    if (!tables.length) {
      throw new NotFoundException('No tables found for this branch.');
    }

    return tables;
  }

  //================== Add one more table ==================
  async createOneMoreTable(
    restaurantId: number,
    branchId: number,
  ): Promise<SuccessResponse> {
    const lastTable = await this.tableRepository.findOne({
      where: {
        restaurantId,
        branchId,
        qrType: QrType.DINE_IN,
      },
      select: {
        tableNumber: true,
      },
      order: {
        tableNumber: 'DESC',
      },
    });

    await this.tableRepository.insert({
      restaurantId,
      branchId,
      tableNumber: (lastTable?.tableNumber ?? 0) + 1,
      qrToken: randomUUID(),
      qrType: QrType.DINE_IN,
    });

    return {
      success: true,
      message: 'New table QR code generated successfully.',
    };
  }

  //================== Delete Table QR Code By ID ==================
  async deleteTableQr(
    id: number,
    restaurantId: number,
    branchId: number,
  ): Promise<SuccessResponse> {
    const table = await this.tableRepository.findOne({
      where: {
        id,
        restaurantId,
        branchId,
      },
    });

    if (!table) {
      throw new NotFoundException('QR code not found.');
    }

    await this.tableRepository.delete({
      id,
      restaurantId,
      branchId,
    });

    return {
      success: true,
      message: 'QR code deleted successfully.',
    };
  }

  //================== Validate QR Token ==================
  async validateQrToken(
    qrToken: string,
    entityManager?: EntityManager,
  ): Promise<Table> {
    const repo = entityManager
      ? entityManager.getRepository(Table)
      : this.tableRepository;

    const table = await repo.findOne({
      where: { qrToken },
      lock: entityManager ? { mode: 'pessimistic_write' } : undefined,
    });

    if (!table) {
      throw new NotFoundException('Table not found or invalid QR code.');
    }

    if (table.qrType !== QrType.DINE_IN) {
      throw new BadRequestException('Only Dine-in tables can be scanned.');
    }

    return table;
  }
}

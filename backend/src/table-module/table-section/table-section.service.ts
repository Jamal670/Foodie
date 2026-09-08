import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { TableSession } from './entity/tableSession.entity';

@Injectable()
export class TableSectionService {
  constructor(
    @InjectRepository(TableSession)
    private readonly sessionRepository: Repository<TableSession>,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreateSession(
    tableId: number,
    restaurantId: number,
    branchId: number,
    userAgent?: string,
    entityManager?: EntityManager,
  ): Promise<{ session: TableSession; isNew: boolean }> {
    const repo = entityManager
      ? entityManager.getRepository(TableSession)
      : this.sessionRepository;

    const existingSession = await repo.findOne({
      where: { tableId, isActive: true },
    });

    if (existingSession) {
      const isExpired =
        existingSession.expiresAt && new Date() > existingSession.expiresAt;

      if (!isExpired) {
        return { session: existingSession, isNew: false };
      } else {
        // Mark expired session as inactive
        existingSession.isActive = false;
        await repo.save(existingSession);
      }
    }

    // Create a new active session for this table
    const newSession = repo.create({
      tableId,
      restaurantId,
      branchId,
      isActive: true,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    try {
      const savedSession = await repo.save(newSession);
      return { session: savedSession, isNew: true };
    } catch (error: any) {
      // Handle Postgres unique constraint violation UQ_one_active_session_per_table (code 23505)
      if (
        error?.code === '23505' ||
        (error?.message &&
          error.message.includes('UQ_one_active_session_per_table'))
      ) {
        const activeSession = await repo.findOne({
          where: { tableId, isActive: true },
        });
        if (activeSession) {
          return { session: activeSession, isNew: false };
        }
      }
      throw error;
    }
  }

  getSaltValue(): number {
    const saltRoundsStr = this.configService.get<string>('CUST_SALT_NUM');
    const parsedSalt = saltRoundsStr ? parseInt(saltRoundsStr, 10) : 10;
    const finalSalt = isNaN(parsedSalt) ? 10 : parsedSalt;
    // Bounding guard to prevent CPU lockups / timeouts if configured with high rounds (e.g. 45)
    return Math.min(Math.max(finalSalt, 4), 15);
  }
}


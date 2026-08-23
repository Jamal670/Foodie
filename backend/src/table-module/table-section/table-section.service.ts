import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { TableSession } from './entity/tableSession.entity';
import { Customer } from '../../customer/entity/customer.entity';

@Injectable()
export class TableSectionService {
  constructor(
    @InjectRepository(TableSession)
    private readonly sessionRepository: Repository<TableSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreateSession(
    tableId: number,
    restaurantId: number,
    branchId: number,
    deviceId?: string,
    entityManager?: EntityManager,
  ): Promise<{ session: TableSession; isNew: boolean }> {
    const repo = entityManager
      ? entityManager.getRepository(TableSession)
      : this.sessionRepository;

    const existingSession = await repo.findOne({
      where: { tableId },
    });

    if (existingSession) {
      const isExpired =
        existingSession.expiresAt && new Date() > existingSession.expiresAt;

      if (existingSession.isActive && !isExpired) {
        if (deviceId) {
          existingSession.deviceId = deviceId;
          const savedSession = await repo.save(existingSession);
          return { session: savedSession, isNew: false };
        }
        return { session: existingSession, isNew: false };
      } else {
        // Reactivate/Renew the expired or inactive session
        existingSession.isActive = true;
        existingSession.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        if (deviceId) {
          existingSession.deviceId = deviceId;
        }

        const sessionToken = randomUUID();
        const saltValue = this.getSaltValue();
        const hashedToken = await bcrypt.hash(sessionToken, saltValue);

        existingSession.token = hashedToken;
        const savedSession = await repo.save(existingSession);

        return { session: savedSession, isNew: true };
      }
    }

    // Create a new session
    const sessionToken = randomUUID();
    const saltValue = this.getSaltValue();
    const hashedToken = await bcrypt.hash(sessionToken, saltValue);

    const newSession = repo.create({
      tableId,
      restaurantId,
      branchId,
      token: hashedToken,
      isActive: true,
      deviceId,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    const savedSession = await repo.save(newSession);
    return { session: savedSession, isNew: true };
  }

  private getSaltValue(): number {
    const saltRoundsStr = this.configService.get<string>('CUST_SALT_NUM');
    const parsedSalt = saltRoundsStr ? parseInt(saltRoundsStr, 10) : 10;
    const finalSalt = isNaN(parsedSalt) ? 10 : parsedSalt;
    // Bounding guard to prevent CPU lockups / timeouts if configured with high rounds (e.g. 45)
    return Math.min(Math.max(finalSalt, 4), 15);
  }

  //===================== Generate Customer Access Token =====================
  private async generateCustomerAccessToken(
    sessionId: number,
    restaurantId: number,
    branchId: number,
    tableId: number,
  ): Promise<string> {
    const secret = this.configService.get<string>('CUSTOMER_ACCESS_TOKEN');
    return this.jwtService.sign(
      {
        sessionId,
        restaurantId,
        branchId,
        tableId,
      },
      {
        secret,
        expiresIn: '2h',
      },
    );
  }

  //===================== Verify Customer Access Token =====================
  async verifySessionToken(
    accessToken: string,
    entityManager?: EntityManager,
  ): Promise<{
    sessionId: number;
    restaurantId: number;
    branchId: number;
    tableId: number;
    session: TableSession;
  } | null> {
    try {
      const secret = this.configService.get<string>('CUSTOMER_ACCESS_TOKEN');
      const payload = this.jwtService.verify(accessToken, { secret });

      if (!payload || !payload.sessionId) {
        return null;
      }

      const repo = entityManager
        ? entityManager.getRepository(TableSession)
        : this.sessionRepository;

      const session = await repo.findOne({
        where: { id: payload.sessionId },
      });

      if (!session) {
        return null;
      }

      // Verify hashed token
      const isMatched = await bcrypt.compare(accessToken, session.token);
      if (!isMatched) {
        return null;
      }

      if (!session.isActive) {
        return null;
      }

      const isExpired = session.expiresAt && new Date() > session.expiresAt;
      if (isExpired) {
        return null;
      }

      return {
        sessionId: payload.sessionId,
        restaurantId: payload.restaurantId,
        branchId: payload.branchId,
        tableId: payload.tableId,
        session,
      };
    } catch (error) {
      return null;
    }
  }

  async registerCustomerConnection(
    customer: Customer,
    session: TableSession,
    restaurantId: number,
    branchId: number,
    tableId: number,
    entityManager?: EntityManager,
  ): Promise<string> {
    const payload = {
      customerId: customer.id,
      sessionId: session.id,
      restaurantId,
      branchId,
      tableId,
    };
    const secret = this.configService.get<string>('CUSTOMER_ACCESS_TOKEN');
    const token = this.jwtService.sign(payload, { secret, expiresIn: '2h' });

    const saltValue = this.getSaltValue();
    const hashed = await bcrypt.hash(token, saltValue);

    if (entityManager) {
      customer.token = hashed;
      await entityManager.getRepository(Customer).save(customer);
    } else {
      throw new Error(
        'EntityManager is required to register customer connection.',
      );
    }

    return token;
  }
}

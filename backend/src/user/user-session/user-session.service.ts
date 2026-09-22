import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { User } from '../users/entity/user.entity';
import { UserSession } from './entity/userSession.entity';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //============================= Generate ACCESS & REFRESH Tokens =============================
  async generateTokens(user: User) {
    const accessTokenSecret =
      this.configService.get<string>('WAITER_JWT_ACCESS_TOKEN') ||
      this.configService.get<string>('JWT_ACCESS_TOKEN');
    const refreshTokenSecret =
      this.configService.get<string>('WAITER_JWT_REFRESH_TOKEN') ||
      this.configService.get<string>('JWT_REFRESH_TOKEN');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error(
        'JWT access or refresh token secret configuration is missing',
      );
    }

    const payload = {
      sub: user.user_id,
      restaurantId: user.restaurantId,
      branchId: user.branchId,
      roleId: user.roleId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshTokenSecret,
      expiresIn: '3d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  //============================= Create Session Data in DB =============================
  async createSession(
    data: {
      userId: number;
      refreshToken: string;
      userAgent?: string;
      ipAddress?: string;
    },
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(UserSession)
      : this.userSessionRepository;


    const rawSalt =
      this.configService.get<string | number>('WAITER_SALT_NUM') ??
      this.configService.get<string | number>('Waiter_SALT_NUM');
    const parsedSalt = rawSalt ? parseInt(String(rawSalt), 10) : 10;
    const saltRounds = isNaN(parsedSalt) ? 10 : parsedSalt;

    const hashedToken = await bcrypt.hash(data.refreshToken, saltRounds);

    return repo.save({
      userId: data.userId,
      refreshToken: hashedToken,
      valid: true,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt: dayjs().add(3, 'day').toDate(),
    });
  }

  //============================= Generate Single Access Token =============================
  async generateAccessToken(user: User) {
    const payload = {
      sub: user.user_id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN'),
      expiresIn: '15m',
    });

    return { accessToken };
  }

  //============================= Find Valid Session =============================
  async findValidSession(userId: number, plainRefreshToken: string) {
    const activeSessions = await this.userSessionRepository.find({
      where: { userId, valid: true },
    });

    for (const session of activeSessions) {
      const isMatch = await bcrypt.compare(
        plainRefreshToken,
        session.refreshToken,
      );
      if (isMatch) return session;
    }
    return null;
  }

  //============================= Invalidate Single User Session =============================
  async invalidateSession(sessionId: string) {
    await this.userSessionRepository.update(
      { id: sessionId },
      { valid: false },
    );
  }

  //============================= Update Session Refresh Token (Rotation) =============================
  async updateSessionRefreshToken(sessionId: string, newRefreshToken: string) {
    const hashedToken = await bcrypt.hash(newRefreshToken, 10);
    const newExpiration = dayjs().add(3, 'day').toDate();

    await this.userSessionRepository.update(
      { id: sessionId },
      {
        refreshToken: hashedToken,
        expiresAt: newExpiration,
      },
    );
  }

  //============================= Update to Invalidate All Specific User Sessions =============================
  async invalidateUserSessions(userId: number) {
    await this.userSessionRepository.update(
      {
        userId: userId,
        valid: true,
      },
      {
        valid: false,
      },
    );
  }
}

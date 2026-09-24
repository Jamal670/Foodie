import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class WaiterJwtPayload {
  sub: number;
  restaurantId: number;
  branchId: number;
  roleId: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class WaiterJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext().req;

    let accessToken =
      req?.cookies?.access_token || req?.cookies?.waiter_access_token;
    const authHeader = req?.headers?.['authorization'];

    if (
      !accessToken &&
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      accessToken = authHeader.substring(7);
    }

    if (
      typeof accessToken !== 'string' ||
      !accessToken.trim() ||
      accessToken.trim() === 'undefined' ||
      accessToken.trim() === 'null'
    ) {
      throw new UnauthorizedException(
        'Your session has expired. Please login again.',
      );
    }

    const secret =
      this.configService.get<string>('WAITER_JWT_ACCESS_TOKEN') ||
      this.configService.get<string>('JWT_ACCESS_TOKEN');

    try {
      const payload: WaiterJwtPayload = await this.jwtService.verifyAsync(
        accessToken,
        { secret },
      );

      // Attach decoded user data to request context
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(
        'Unauthorized access: Invalid or expired Waiter token.',
      );
    }
  }
}

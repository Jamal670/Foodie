import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';

import { CreateUserDto } from '../user/users/DTO/user.created.dto';
import { FgtPasswordDto } from '../user/users/DTO/user.fgtPassword.dto';
import { ResetPasswordDto } from '../user/users/DTO/resetPassword.dto';
import { ResendVerificationDto } from './DTO/ResendVerificationDto .dto';
import { RoleEmailVerifyDto } from './DTO/roleEmailVerify.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.Signup(dto);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Req()
    req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyUser(token, req);

    if (result.accessToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1 * 60 * 1000,
      });
    }

    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      message: result.message,
    };
  }

  @Post('role-email-verify')
  async verifyRoleEmail(
    @Body()
    dto: RoleEmailVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    const result = await this.authService.verifyRoleEmail(dto.token, req);

    if (result.success && result.accessToken && result.refreshToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      return true;
    }

    return false;
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationLink(dto.email);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('regenerate-access-token')
  async regenerateAccessToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.regenerateAccessToken(req);

    if (result.accessToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
    }

    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
    }

    return result;
  }

  @Post('login')
  async login(
    @Body() dto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, req);

    if (result?.accessToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
    }

    if (result?.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
    }

    return result;
  }

  @Post('fgt-password')
  async fgtPassword(@Body() dto: FgtPasswordDto) {
    return this.authService.fgtPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.password,
      dto.confirmPassword,
      dto.token,
    );
  }
}


import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { MailService } from 'src/common/mail/mail.service';
import { UserService } from 'src/user/users/user.service';
import { CreateUserDto } from 'src/user/users/DTO/user.created.dto';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { UserSessionService } from 'src/user/user-session/user-session.service';
import { UserStatus } from 'src/user/users/entity/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleModuleService: RoleModuleService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userSessionService: UserSessionService,
  ) {}

  // ================== Background Email Helpers ==================
  private async sendEmailInBackground(email: string, token: string) {
    // fire-and-forget, no need to await in main flow
    try {
      await this.mailService.sendVerificationEmail(email, token);
    } catch (err) {
      console.error('Verification email sending failed for:', email, err);
    }
  }

  private async sendForgotPasswordEmailInBackground(
    email: string,
    token: string,
  ) {
    try {
      await this.mailService.sendForgotPasswordEmail(email, token);
    } catch (err) {
      console.error('Forgot password email sending failed for:', email, err);
    }
  }

  //========================== Signup ============================
  async Signup(dto: CreateUserDto) {
    try {
      // Check existing user
      const existingUser = await this.userService.CheckEmailExists(dto.email);

      if (existingUser) {
        // Already verified
        if (existingUser.isVerified === 'verified') {
          throw new ConflictException('Email already exists');
        }

        // Pending or inactive user
        if (
          existingUser.isVerified === UserStatus.PENDING ||
          existingUser.isVerified === UserStatus.INACTIVE
        ) {
          // Change status to pending
          await this.userService.updateVerificationStatus(
            existingUser.user_id,
            UserStatus.PENDING,
          );

          // Generate new verification token
          const payload = {
            sub: existingUser.user_id,
          };

          const token = await this.jwtService.signAsync(payload);

          // Send verification email again
          this.sendEmailInBackground(existingUser.email, token);

          return {
            message:
              'Verification email has been sent again. Please verify your email.',
          };
        }
      }

      // Hash password
      const saltRounds = Number(
        this.configService.get<string>('PASS_SALT_NUM'),
      );

      dto.password = await bcrypt.hash(dto.password, saltRounds);

      // Create user
      const user = await this.userService.CreateNewUser(dto);

      // Generate verification token
      const payload = {
        sub: user.user_id,
      };

      const token = await this.jwtService.signAsync(payload);

      // Send email in background
      this.sendEmailInBackground(user.email, token);

      return {
        message: 'Signup successful. Please verify your email.',
        user,
      };
    } catch (error) {
      console.error('Signup Error:', error);

      // Re-throw known HTTP exceptions
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException(
        'Something went wrong during signup',
      );
    }
  }

  //=========== Verify User from pending to verified if not status is inactive ===========
  async verifyUser(token: string, req: Request) {
    try {
      const decoded = this.jwtService.verify(token);
      console.log('Token verified');

      const userId = decoded.sub;

      if (!userId) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.userService.findUserById(userId);
      console.log('User found');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified === 'verified') {
        return {
          message: 'Email already verified',
        };
      }

      await this.userService.verifyUser(userId);
      console.log('User verification updated');

      const { accessToken, refreshToken } =
        await this.userSessionService.generateTokens(user);
      console.log('Access token generated');
      console.log('Refresh token generated');

      const userAgent = req.headers['user-agent'];

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      await this.userSessionService.createSession({
        userId: user.user_id,
        refreshToken,
        userAgent,
        ipAddress: String(ipAddress),
      });
      console.log('Session created');

      return {
        message: 'Email verified successfully',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Verify Email Error:', error);

      // Token expired
      if (error.name === 'TokenExpiredError') {
        // Decode expired token
        const decoded: any = this.jwtService.decode(token);

        if (decoded?.sub) {
          const user = await this.userService.findUserById(decoded.sub);

          if (user && user.isVerified === 'pending') {
            await this.userService.TokenExpiredToInactive(decoded.sub);
          }
        }

        throw new BadRequestException(
          'Verification link expired. Please signup again.',
        );
      } else if (error.name === 'JsonWebTokenError') {
        // Invalid token
        throw new BadRequestException('Invalid verification token');
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while verifying the email',
      );
    }
  }

  //============================= Resend Verification Link =============================
  async resendVerificationLink(email: string) {
    try {
      // Find user
      const user = await this.userService.CheckEmailExists(email);

      if (!user) {
        throw new NotFoundException('No account found with this email address');
      }

      // Already verified
      if (user.isVerified === 'verified') {
        throw new BadRequestException('Email is already verified');
      }

      // If inactive => make pending
      if (user.isVerified === 'inactive') {
        await this.userService.updateVerificationStatus(
          user.user_id,
          UserStatus.PENDING,
        );
      }

      // Generate fresh token
      const token = await this.jwtService.signAsync({
        sub: user.user_id,
      });

      // Send email in background
      this.sendEmailInBackground(user.email, token);

      return {
        success: true,
        message: 'Verification link has been sent successfully',
      };
    } catch (error) {
      // Preserve known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log unexpected errors only
      console.error('Resend Verification Error:', error);

      throw new InternalServerErrorException(
        'Unable to resend verification email at this time',
      );
    }
  }

  //============================= Regenerate Access Token =============================
  async regenerateAccessToken(req: any) {
    try {
      const userPayload = req.user;
      if (!userPayload || !userPayload.sub) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      const refreshToken = req.cookies.refresh_token;
      const userIdNum = Number(userPayload.sub);

      const user = await this.userService.findUserById(userIdNum);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2 & 3. Get Session From DB and Validate
      const session = await this.userSessionService.findValidSession(
        userIdNum,
        refreshToken,
      );

      if (!session) {
        throw new UnauthorizedException(
          'Session is invalid or has been revoked',
        );
      }

      // 4. Check Session Expiration
      if (session.expiresAt.getTime() < Date.now()) {
        await this.userSessionService.invalidateSession(session.id);
        throw new UnauthorizedException('Session has expired');
      }

      // 5. Generate New Tokens via UserSessionService
      const { accessToken, refreshToken: newRefreshToken } =
        await this.userSessionService.generateTokens(user);

      // 6. Update Session with New Refresh Token
      await this.userSessionService.updateSessionRefreshToken(
        session.id,
        newRefreshToken,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Regenerate Access Token Error:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while regenerating access token',
      );
    }
  }

  //============================= Login =============================
  async login(dto: CreateUserDto, req: Request) {
    try {
      // Find user
      const user = await this.userService.findUserByEmailForAuth(dto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Pending or inactive user
      if (user.isVerified === 'pending' || user.isVerified === 'inactive') {
        // Change status to pending
        await this.userService.updateVerificationStatus(
          user.user_id,
          UserStatus.PENDING,
        );

        // Generate new verification token
        const payload = {
          sub: user.user_id,
        };

        const token = await this.jwtService.signAsync(payload);

        // Send verification email again
        this.sendEmailInBackground(user.email, token);

        return {
          message:
            'Verification email has been sent again. Please verify your email.',
        };
      }

      // Already verified
      if (user.isVerified === 'verified') {
        // Invalidate all previous sessions
        await this.userSessionService.invalidateUserSessions(user.user_id);

        // Generate access token & refresh token
        const { accessToken, refreshToken } =
          await this.userSessionService.generateTokens(user);

        // Create new session
        const userAgent = req.headers['user-agent'];
        const ipAddress =
          (req.headers['x-forwarded-for'] as string) ||
          req.socket.remoteAddress;

        await this.userSessionService.createSession({
          userId: user.user_id,
          refreshToken,
          userAgent,
          ipAddress: String(ipAddress),
        });

        // Return tokens
        return {
          message: 'Login successful',
          OnBoardingStatus: user.OnBoardingStatus,
          accessToken,
          refreshToken,
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('Login Error:', error);

      throw new InternalServerErrorException(
        'Something went wrong during login',
      );
    }
  }

  //============================= Forgot Password =============================
  async fgtPassword(email: string) {
    try {
      const user = await this.userService.CheckEmailExists(email);

      // 🔒 SECURITY: Don't reveal if email exists or not
      if (!user || user.isVerified !== 'verified') {
        return {
          success: true,
          message:
            'If the email is registered and verified, a reset link has been sent.',
        };
      }

      // Generate 15 min token
      const token = await this.jwtService.signAsync(
        {
          sub: user.user_id,
          type: 'reset-password',
        },
        {
          expiresIn: '15m',
        },
      );

      // Send reset email
      this.sendForgotPasswordEmailInBackground(user.email, token);

      return {
        success: true,
        message: 'Password reset link sent successfully',
      };
    } catch (error) {
      console.error('Forgot Password Error:', error);

      throw new InternalServerErrorException(
        'Unable to process request at this time',
      );
    }
  }

  //============================= Reset Password =============================
  async resetPassword(
    password: string,
    confirmPassword: string,
    token: string,
  ) {
    try {
      // 1. Password match check
      if (password !== confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      // 2. Verify token
      let decoded;
      try {
        decoded = await this.jwtService.verifyAsync(token);
      } catch (err) {
        throw new BadRequestException('Invalid or expired token');
      }

      const userId = decoded.sub;

      // 3. Find user
      const user = await this.userService.findUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 4. Check if verified user (security rule)
      if (user.isVerified !== 'verified') {
        throw new BadRequestException('User not authorized');
      }

      // 5. Hash new password
      const saltRounds = Number(
        this.configService.get<string>('PASS_SALT_NUM'),
      );
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 6. Update password via user service
      await this.userService.updatePassword(userId, hashedPassword);

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Reset Password Error:', error);

      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}

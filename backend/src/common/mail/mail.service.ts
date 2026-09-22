import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    const verifyLink = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: '"Restaurant System" <no-reply@restaurant.com>',
      to: email,
      subject: 'Verify your email',
      html: `
  <h2>Email Verification</h2>
  <p>Please click the link below to verify your email:</p>
  <a href="${verifyLink}">Verify Email</a>
  <p>${verifyLink}</p>
  `,
    });
  }

  //============================= Send Forgot Password Email =============================
  async sendForgotPasswordEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    const resetLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/create-new-fgt-password?token=${token}`;

    await transporter.sendMail({
      from: '"Restaurant System" <no-reply@restaurant.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
      <h2>Password Reset Request</h2>
      <p>Click below link to reset your password. This link will expire in 15 minutes.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>${resetLink}</p>
    `,
    });
  }

  //============================= Send Staff Role Verification Email =============================
  async sendRoleVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    const verifyLink = `${this.configService.get('FRONTEND_URL')}/role-email-verify/${token}`;

    await transporter.sendMail({
      from: '"Restaurant System" <no-reply@restaurant.com>',
      to: email,
      subject: 'Verify Staff Role Email',
      html: `
      <h2>Staff Account Verification</h2>
      <p>Please click the link below to verify your staff email address. This link is valid for 30 minutes:</p>
      <a href="${verifyLink}">Verify Staff Email</a>
      <p>${verifyLink}</p>
    `,
    });
  }
}


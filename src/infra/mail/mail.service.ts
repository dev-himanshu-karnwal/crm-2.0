import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure'),
      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.pass'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.config.get<string>('mail.from');
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.debug(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your One-Time Password (OTP)';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Security Verification</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">Use the following code to verify your action. This code is valid for 5 minutes.</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} CRM Platform. All rights reserved.</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }
}

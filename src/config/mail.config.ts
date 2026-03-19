import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER || 'nodemailer',
  from: process.env.MAIL_FROM,
  host: process.env.MAIL_SMTP_HOST,
  port: parseInt(process.env.MAIL_SMTP_PORT || '587', 10),
  secure: process.env.MAIL_SMTP_SECURE === 'true',
  user: process.env.MAIL_SMTP_USER,
  pass: process.env.MAIL_SMTP_PASS,
}));

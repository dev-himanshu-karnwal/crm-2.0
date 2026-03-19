import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { OtpType } from '../enums/otp-type.enum';
import { OtpRepository } from '../repo/otp.repository';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly otpRepo: OtpRepository) {}

  async generateOtp(identifier: string, type: OtpType): Promise<string> {
    this.logger.debug(`Generating OTP for ${identifier} (${type})`);

    // Generate 6-digit OTP
    const otpCode = randomInt(100000, 999999).toString();

    // Hash the OTP for security
    const salt = await bcrypt.genSalt();
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    // Set expiry to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Remove any existing OTPs for this identifier and type
    await this.otpRepo.deleteMany(identifier, type);

    // Save new OTP
    await this.otpRepo.create({
      identifier,
      type,
      otp: hashedOtp,
      expiresAt,
    });

    return otpCode;
  }

  async verifyOtp(
    identifier: string,
    type: OtpType,
    otp: string,
  ): Promise<boolean> {
    this.logger.debug(`Verifying OTP for ${identifier} (${type})`);

    const otpEntity = await this.otpRepo.findOne(identifier, type);

    if (!otpEntity) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (otpEntity.isVerified) {
      throw new BadRequestException('OTP already used');
    }

    if (new Date() > otpEntity.expiresAt) {
      await this.otpRepo.deleteOne(otpEntity.id);
      throw new BadRequestException('OTP expired');
    }

    if (otpEntity.attempts >= 3) {
      await this.otpRepo.deleteOne(otpEntity.id);
      throw new BadRequestException(
        'Too many failed attempts. Please request a new OTP.',
      );
    }

    const isValid = await bcrypt.compare(otp, otpEntity.otp);

    if (!isValid) {
      const newAttempts = otpEntity.attempts + 1;
      if (newAttempts >= 3) {
        await this.otpRepo.deleteOne(otpEntity.id);
        throw new BadRequestException(
          'Too many failed attempts. OTP has been invalidated.',
        );
      }
      await this.otpRepo.updateAttempts(otpEntity.id, newAttempts);
      throw new BadRequestException(
        `Invalid OTP. ${3 - newAttempts} attempts remaining.`,
      );
    }

    // OTP is valid
    await this.otpRepo.markAsVerified(otpEntity.id);

    return true;
  }

  async deleteOtp(identifier: string, type: OtpType): Promise<void> {
    await this.otpRepo.deleteMany(identifier, type);
  }

  async findVerifiedOtp(identifier: string, type: OtpType): Promise<boolean> {
    const otpEntity = await this.otpRepo.findOne(identifier, type);
    return !!(otpEntity && otpEntity.isVerified);
  }
}

import { OtpType } from '../enums/otp-type.enum';

export class OtpEntity {
  constructor(
    public readonly id: string,
    public readonly identifier: string,
    public readonly type: OtpType,
    public readonly otp: string,
    public readonly expiresAt: Date,
    public readonly isVerified: boolean,
    public readonly attempts: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

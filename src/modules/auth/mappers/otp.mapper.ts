import { OtpEntity } from '../entities/otp.entity';
import { OtpType } from '../enums/otp-type.enum';

export interface OtpDocLike {
  _id: { toString(): string };
  identifier: string;
  type: OtpType;
  otp: string;
  expiresAt: Date;
  isVerified: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OtpMapper {
  static toDomain(doc: OtpDocLike): OtpEntity {
    return new OtpEntity(
      doc._id.toString(),
      doc.identifier,
      doc.type,
      doc.otp,
      doc.expiresAt,
      doc.isVerified,
      doc.attempts,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}

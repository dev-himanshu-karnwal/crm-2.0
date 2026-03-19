import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpType } from '../enums/otp-type.enum';

@Schema({ timestamps: true, collection: 'otps' })
export class Otp extends Document {
  @Prop({ required: true })
  identifier: string; // email or user_id

  @Prop({ required: true, enum: OtpType })
  type: OtpType;

  @Prop({ required: true })
  otp: string; // Hashed OTP

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0 })
  attempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index to expire documents automatically
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

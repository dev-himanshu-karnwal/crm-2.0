import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from '../schemas/otp.schema';
import { OtpEntity } from '../entities/otp.entity';
import { OtpMapper, OtpDocLike } from '../mappers/otp.mapper';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class OtpRepository {
  constructor(
    @InjectModel(Otp.name)
    private readonly otpModel: Model<Otp>,
  ) {}

  async findOne(identifier: string, type: OtpType): Promise<OtpEntity | null> {
    const doc = await this.otpModel.findOne({ identifier, type }).lean().exec();

    return doc ? OtpMapper.toDomain(doc as unknown as OtpDocLike) : null;
  }

  async create(data: {
    identifier: string;
    type: OtpType;
    otp: string;
    expiresAt: Date;
  }): Promise<OtpEntity> {
    const [doc] = await this.otpModel.create([data]);
    return OtpMapper.toDomain(doc.toObject() as unknown as OtpDocLike);
  }

  async deleteMany(identifier: string, type: OtpType): Promise<void> {
    await this.otpModel.deleteMany({ identifier, type }).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await this.otpModel.deleteOne({ _id: id }).exec();
  }

  async updateAttempts(id: string, attempts: number): Promise<void> {
    await this.otpModel.updateOne({ _id: id }, { attempts }).exec();
  }

  async markAsVerified(id: string): Promise<void> {
    await this.otpModel.updateOne({ _id: id }, { isVerified: true }).exec();
  }
}

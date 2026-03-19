import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, Length } from 'class-validator';
import { OtpType } from '../enums/otp-type.enum';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com or DCTEMP123' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ enum: OtpType, example: OtpType.LOGIN })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}

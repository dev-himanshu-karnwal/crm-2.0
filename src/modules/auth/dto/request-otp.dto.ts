import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OtpType } from '../enums/otp-type.enum';

export class RequestOtpDto {
  @ApiProperty({ example: 'user@example.com or DCTEMP123' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ enum: OtpType, example: OtpType.LOGIN })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;
}

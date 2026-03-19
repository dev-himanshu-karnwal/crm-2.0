import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  REGISTRATION_TYPE,
  type RegistrationType,
} from '../../users/enums/registration-type.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'HR',
    enum: REGISTRATION_TYPE,
    description: 'Who is registering: HR, EMPLOYEE, INTERN or CONTRACTOR',
  })
  @IsEnum(REGISTRATION_TYPE)
  registrationType: RegistrationType;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

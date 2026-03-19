import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'OldPass@123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPass@123' })
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  @Matches(/((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])).{8,}$/, {
    message:
      'Password is too weak. Must contain uppercase, lowercase, number and special character.',
  })
  newPassword: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UserSuccessResponseDataDto {
  @ApiProperty({ type: UserResponseDto })
  entity: UserResponseDto;
}

export class UserSuccessResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: UserSuccessResponseDataDto })
  data: UserSuccessResponseDataDto;
}

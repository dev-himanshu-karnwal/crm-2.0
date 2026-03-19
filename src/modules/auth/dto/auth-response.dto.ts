import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDataDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: 'DCT123' })
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ type: AuthResponseDataDto })
  data: {
    entity: AuthResponseDataDto;
  };
}

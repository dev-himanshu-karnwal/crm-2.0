import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseApiResponseDto } from '../../../common/dto/api-response.dto';

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

export class AuthResponseDataWrapperDto {
  @ApiProperty({ type: AuthResponseDataDto })
  entity: AuthResponseDataDto;
}

export class AuthResponseDto extends BaseApiResponseDto {
  @ApiProperty({ type: AuthResponseDataWrapperDto })
  data: AuthResponseDataWrapperDto;
}

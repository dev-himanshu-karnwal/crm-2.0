import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseStatus } from '../enums/api-response-status.enum';

export class BaseApiResponseDto {
  @ApiProperty({
    enum: ApiResponseStatus,
    example: ApiResponseStatus.SUCCESS,
  })
  status: ApiResponseStatus;

  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

export class SuccessResponseDataDto {
  @ApiProperty({ example: null, nullable: true })
  entity: any;
}

export class SuccessResponseDto {
  @ApiProperty({ example: ApiResponseStatus.SUCCESS })
  status: ApiResponseStatus;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ type: SuccessResponseDataDto })
  data: SuccessResponseDataDto;
}

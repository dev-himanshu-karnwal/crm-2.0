import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseStatus } from '../enums/api-response-status.enum';
import { Type } from '@nestjs/common';

export class BaseApiResponseDto {
  @ApiProperty({
    enum: ApiResponseStatus,
    example: ApiResponseStatus.SUCCESS,
  })
  status: ApiResponseStatus;

  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

export function ApiResponseDto<T>(DataDto?: Type<T>) {
  // Nested wrapper to match server response structure: { status, message, data: { entity } }
  abstract class ApiResponseData {
    @ApiProperty({
      type: DataDto,
      example: DataDto ? undefined : null,
      nullable: !DataDto,
    })
    entity: T;
  }

  abstract class SuccessResponse extends BaseApiResponseDto {
    @ApiProperty({ type: ApiResponseData })
    data: ApiResponseData;
  }

  return SuccessResponse as Type<BaseApiResponseDto & { data: { entity: T } }>;
}

export class SuccessResponseDto extends ApiResponseDto() {}

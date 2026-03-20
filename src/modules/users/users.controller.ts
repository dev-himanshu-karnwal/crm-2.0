import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: ApiResponseDto(UserResponseDto) })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid ObjectId' })
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }
}

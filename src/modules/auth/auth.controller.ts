import { Controller, Post, Body, Inject, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { IAuthService } from './interfaces/auth-service.interface';
import { AUTH_SERVICE_TOKEN } from '../../common/constants/injection-tokens';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User Signup',
    description: 'Register a new user in the system.',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async signUp(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate a user and return an access token.',
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Returns the currently logged-in user profile.',
  })
  @ApiOkResponse({
    description: 'User profile fetched successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return await this.authService.getMe(user.sub);
  }
}

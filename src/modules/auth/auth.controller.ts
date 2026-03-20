import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { IAuthService } from './interfaces/auth-service.interface';
import { AUTH_SERVICE_TOKEN } from '../../common/constants/injection-tokens';
import { UserSuccessResponseDto } from '../users/dto/user-success-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SuccessResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Auth')
@ApiExtraModels(AuthResponseDto, SuccessResponseDto, UserSuccessResponseDto)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {}

  @Post('register-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'User Register',
    description:
      'Register a new user in the system (Restricted to Admin and HR).',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async registerUser(
    @Body() registerDto: RegisterDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.authService.registerUser(registerDto, currentUser);
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

  @Post('otp/request')
  @ApiOperation({
    summary: 'Request OTP',
    description:
      'Send a one-time password to the user email for various purposes (LOGIN, FORGOT_PASSWORD, RESET_PASSWORD).',
  })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    type: SuccessResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid identifier or type' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verify OTP for various purposes. Returns an access token if type is LOGIN.',
  })
  @ApiOkResponse({
    description: 'Verification successful (and Login if type is LOGIN)',
    type: SuccessResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Patch('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password (Reset)',
    description: 'Reset password after OTP verification.',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    type: SuccessResponseDto,
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Patch('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset Password (Authenticated)',
    description:
      'Update password for a currently logged-in user after OTP verification.',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
    type: SuccessResponseDto,
  })
  async resetPassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user.email, dto);
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
    type: UserSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return await this.authService.getMe(user.sub);
  }
}

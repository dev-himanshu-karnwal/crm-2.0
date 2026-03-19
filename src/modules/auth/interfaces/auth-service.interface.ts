import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ApiResponseBody } from '../../../common/interfaces/api-response.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthResponseDataDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface IAuthService {
  registerUser(
    dto: RegisterDto,
    currentUser: JwtPayload,
  ): Promise<ApiResponseBody<UserResponseDto>>;
  login(dto: LoginDto): Promise<ApiResponseBody<AuthResponseDataDto>>;
  getMe(userId: string): Promise<ApiResponseBody<UserResponseDto>>;
  requestOtp(dto: RequestOtpDto): Promise<ApiResponseBody<null>>;
  verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<ApiResponseBody<AuthResponseDataDto | null>>;
  forgotPassword(dto: ForgotPasswordDto): Promise<ApiResponseBody<null>>;
  resetPassword(
    userId: string,
    dto: ResetPasswordDto,
  ): Promise<ApiResponseBody<null>>;
}

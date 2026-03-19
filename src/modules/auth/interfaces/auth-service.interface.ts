import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiResponseBody } from '../../../common/interfaces/api-response.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthResponseDataDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface IAuthService {
  signUp(
    dto: RegisterDto,
    currentUser: JwtPayload,
  ): Promise<ApiResponseBody<AuthResponseDataDto>>;
  login(dto: LoginDto): Promise<ApiResponseBody<AuthResponseDataDto>>;
  getMe(userId: string): Promise<ApiResponseBody<UserResponseDto>>;
}

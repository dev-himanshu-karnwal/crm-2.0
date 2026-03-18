import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiResponseBody } from '../../../common/interfaces/api-response.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface IAuthService {
  signUp(dto: RegisterDto): Promise<ApiResponseBody<UserResponseDto>>;
  login(dto: LoginDto): Promise<ApiResponseBody<{ accessToken: string }>>;
}

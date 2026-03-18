import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { IAuthService } from '../interfaces/auth-service.interface';
import { ApiResponse } from '../../../common/classes/api-response.class';
import { ApiResponseBody } from '../../../common/interfaces/api-response.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: RegisterDto): Promise<ApiResponseBody<UserResponseDto>> {
    this.logger.debug(`Registering new user: ${dto.email}`);

    // 1. Check if user already exists
    const existingUser = await this.usersService.findEntityByEmailOrUserId(
      dto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Create user
    const newUser = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      registrationType: dto.registrationType,
    });

    return ApiResponse.success(newUser, 'User registered successfully');
  }

  async login(
    dto: LoginDto,
  ): Promise<ApiResponseBody<{ accessToken: string }>> {
    this.logger.debug(`Login attempt for: ${dto.identifier}`);

    // 1. Find user
    const user = await this.usersService.findEntityByEmailOrUserId(
      dto.identifier,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Validate password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate JWT
    const payload = {
      sub: user.id, // Assuming user.id exists (Mongoose _id)
      userId: user.userId,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);

    return ApiResponse.success({ accessToken: token }, 'Login successful');
  }
}

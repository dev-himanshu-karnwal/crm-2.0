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
import { UserMapper } from '../../users/mappers/user.mapper';
import { AuthResponseDataDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { REGISTRATION_TYPE } from '../../users/enums/registration-type.enum';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(
    dto: RegisterDto,
    currentUser: JwtPayload,
  ): Promise<ApiResponseBody<AuthResponseDataDto>> {
    this.logger.debug(`Registering new user: ${dto.email}`);

    // 1. Validate permissions based on role
    const isAdmin = currentUser.roles.includes('admin');
    const isHr = currentUser.roles.includes(REGISTRATION_TYPE.HR);

    if (isHr && !isAdmin) {
      // HR can only register employee, intern, contractor
      const allowedTypes: string[] = [
        REGISTRATION_TYPE.EMPLOYEE,
        REGISTRATION_TYPE.INTERN,
        REGISTRATION_TYPE.CONTRACTOR,
      ];
      if (!allowedTypes.includes(dto.registrationType)) {
        throw new ForbiddenException(
          'HR can only register employees, interns, and contractors',
        );
      }
    } else if (!isAdmin) {
      // Should be caught by guard, but let's be safe
      throw new ForbiddenException('Only Admin and HR can register new users');
    }

    // 2. Check if user already exists
    const existingUser = await this.usersService.findEntityByEmailOrUserId(
      dto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 4. Create user
    const newUser = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      registrationType: dto.registrationType,
    });

    // 5. Generate JWT
    const payload: JwtPayload = {
      sub: newUser.id,
      userId: newUser.userId,
      email: newUser.email,
      roles: newUser.roles,
    };
    const token = await this.jwtService.signAsync(payload);

    return ApiResponse.success(
      {
        accessToken: token,
        userId: newUser.userId,
        email: newUser.email,
        name: newUser.name,
      },
      'User registered successfully',
    );
  }

  async login(dto: LoginDto): Promise<ApiResponseBody<AuthResponseDataDto>> {
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
    const fetchedUser = await this.usersService.findById(user.id);
    const payload: JwtPayload = {
      sub: user.id,
      userId: user.userId,
      email: user.email,
      roles: fetchedUser.roles,
    };
    const token = await this.jwtService.signAsync(payload);

    return ApiResponse.success(
      {
        accessToken: token,
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      'Login successful',
    );
  }

  async getMe(userId: string): Promise<ApiResponseBody<UserResponseDto>> {
    const user = await this.usersService.findEntityByEmailOrUserId(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return ApiResponse.success(
      UserMapper.toResponse(user),
      'User profile fetched successfully',
    );
  }
}

import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { IAuthService } from '../interfaces/auth-service.interface';
import { ApiResponse } from '../../../common/classes/api-response.class';
import { ApiResponseBody } from '../../../common/interfaces/api-response.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthResponseDataDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { REGISTRATION_TYPE } from '../../users/enums/registration-type.enum';
import { ForbiddenException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailService } from '../../../infra/mail/mail.service';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async registerUser(
    dto: RegisterDto,
    currentUser: JwtPayload,
  ): Promise<ApiResponseBody<UserResponseDto>> {
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

    return ApiResponse.success(newUser, 'User registered successfully');
  }

  async login(dto: LoginDto): Promise<ApiResponseBody<AuthResponseDataDto>> {
    this.logger.debug(`Login attempt for: ${dto.identifier}`);

    const isVerified = await this.otpService.findVerifiedOtp(
      dto.identifier,
      OtpType.LOGIN,
    );
    if (!isVerified) {
      throw new BadRequestException(
        'OTP not verified. Please verify the OTP before login.',
      );
    }

    // 2. Find user
    const user = await this.usersService.findEntityByEmailOrUserId(
      dto.identifier,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Validate password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Generate JWT
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
    const user = await this.usersService.findByEmailOrUserId(userId);
    if (!user || !user.name) {
      throw new UnauthorizedException('User not found');
    }
    return ApiResponse.success(user, 'User profile fetched successfully');
  }

  async requestOtp(dto: RequestOtpDto): Promise<ApiResponseBody<null>> {
    this.logger.debug(`Requesting OTP for ${dto.identifier} (${dto.type})`);

    const user = await this.usersService.findEntityByEmailOrUserId(
      dto.identifier,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = await this.otpService.generateOtp(dto.identifier, dto.type);
    await this.mailService.sendOtp(user.email, otp);

    return ApiResponse.success(null, 'OTP sent successfully to your email');
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<ApiResponseBody<AuthResponseDataDto | null>> {
    this.logger.debug(`Verifying OTP for ${dto.identifier} (${dto.type})`);

    await this.otpService.verifyOtp(dto.identifier, dto.type, dto.otp);

    // If it's a login OTP, return the token immediately
    if (dto.type === OtpType.LOGIN) {
      const user = await this.usersService.findEntityByEmailOrUserId(
        dto.identifier,
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const fetchedUser = await this.usersService.findById(user.id);
      const payload: JwtPayload = {
        sub: user.id,
        userId: user.userId,
        email: user.email,
        roles: fetchedUser.roles,
      };
      const token = await this.jwtService.signAsync(payload);

      // Clear OTP after successful login
      await this.otpService.deleteOtp(dto.identifier, dto.type);

      return ApiResponse.success(
        {
          accessToken: token,
          userId: user.userId,
          email: user.email,
          name: user.name,
        },
        'Login successful via OTP',
      );
    }

    // For other types, just confirm verification
    return ApiResponse.success(null, 'OTP verified successfully');
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ApiResponseBody<null>> {
    this.logger.debug(`Resetting password for ${dto.identifier}`);

    // 1. Check if OTP was verified first
    const isVerified = await this.otpService.findVerifiedOtp(
      dto.identifier,
      OtpType.FORGOT_PASSWORD,
    );
    if (!isVerified) {
      throw new BadRequestException(
        'OTP not verified. Please verify the OTP before resetting the password.',
      );
    }

    // 2. Update password
    await this.usersService.updatePassword(dto.identifier, dto.newPassword);

    // 3. Clear OTP
    await this.otpService.deleteOtp(dto.identifier, OtpType.FORGOT_PASSWORD);

    return ApiResponse.success(null, 'Password reset successfully');
  }

  async resetPassword(
    userEmail: string,
    dto: ResetPasswordDto,
  ): Promise<ApiResponseBody<null>> {
    this.logger.debug(`Resetting password for user ${userEmail}`);

    // 1. Find user by DB ID
    const user = await this.usersService.findEntityByEmailOrUserId(userEmail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Validate current password
    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // 3. Check if OTP was verified
    const isVerified = await this.otpService.findVerifiedOtp(
      userEmail,
      OtpType.RESET_PASSWORD,
    );
    if (!isVerified) {
      throw new BadRequestException(
        'OTP not verified. Please verify the OTP before updating the password.',
      );
    }

    // 4. Update password by ID
    await this.usersService.updatePasswordById(user.id, dto.newPassword);

    // 5. Clear OTP
    await this.otpService.deleteOtp(userEmail, OtpType.RESET_PASSWORD);

    return ApiResponse.success(null, 'Password updated successfully');
  }
}

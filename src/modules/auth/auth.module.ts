import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { RoleSchema } from '../users/schemas/role.schema';
import { PermissionSchema } from '../users/schemas/permission.schema';
import { AUTH_SERVICE_TOKEN } from '../../common/constants/injection-tokens';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { OtpService } from './services/otp.service';
import { OtpRepository } from './repo/otp.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: 'Role', schema: RoleSchema },
      { name: 'Permission', schema: PermissionSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: {
          expiresIn: (configService.get<string | number>('JWT_EXPIRATION') ||
            '1d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: AuthService,
    },
    AuthService,
    OtpService,
    OtpRepository,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AUTH_SERVICE_TOKEN, AuthService, OtpService, OtpRepository],
})
export class AuthModule {}

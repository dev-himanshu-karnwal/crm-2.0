import { Injectable, Logger, Inject } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../../../common/constants/injection-tokens';
import { ResourceNotFoundException } from '../../../common/exceptions/resource-not-found.exception';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { IUserService } from '../interfaces/user-service.interface';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { RegistrationType } from '../enums/registration-type.enum';
import { randomInt } from 'crypto';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService implements IUserService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.debug(`Finding user by id: ${id}`);
    const entity = await this.userRepo.findById(id);
    if (!entity) {
      throw new ResourceNotFoundException('User', id);
    }
    return UserMapper.toResponse(entity);
  }

  async findByEmailOrUserId(identifier: string): Promise<UserResponseDto> {
    this.logger.debug(`Finding user by identifier: ${identifier}`);
    const entity = await this.userRepo.findByEmailOrUserId(identifier);
    if (!entity) {
      throw new ResourceNotFoundException('User', identifier);
    }
    return UserMapper.toResponse(entity);
  }

  /**
   * Internal method for Auth to get full entity with password
   */
  async findEntityByEmailOrUserId(identifier: string) {
    return this.userRepo.findByEmailOrUserId(identifier);
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const userIdToUse = this.generateUserId(data.registrationType);

    // Find the role ID for the registration type
    const role = await this.userRepo.findRoleByName(data.registrationType);
    if (!role) {
      this.logger.error(`Role not found for type: ${data.registrationType}`);
      throw new Error(`System error: default role not configured`);
    }

    const entity = await this.userRepo.create({
      ...data,
      userId: userIdToUse,
      role: role._id,
    });
    return UserMapper.toResponse(entity);
  }

  private generateUserId(registerType: RegistrationType): string {
    let prefix: string;

    switch (registerType) {
      case 'hr':
      case 'employee':
        prefix = 'DCTEMP';
        break;

      case 'intern':
        prefix = 'DCTINT';
        break;

      case 'contractor':
        prefix = 'CONTDCT';
        break;

      default:
        prefix = 'DCTUSR';
    }

    // 3-digit random number (100–999)
    const randomNumber = randomInt(100, 1000);

    return `${prefix}${randomNumber}`;
  }
}

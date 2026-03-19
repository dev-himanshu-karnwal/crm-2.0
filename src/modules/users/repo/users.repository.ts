import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { UserEntity } from '../entities/user.entity';
import { UserMapper, UserDocLike } from '../mappers/user.mapper';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({ _id: id, deletedAt: null })
      .lean()
      .exec();
    return doc ? UserMapper.toDomain(doc as unknown as UserDocLike) : null;
  }

  async findByEmailOrUserId(identifier: string): Promise<UserEntity | null> {
    const normalizedIdentifier = identifier.trim();
    const doc = await this.userModel
      .findOne({
        $or: [
          { email: normalizedIdentifier.toLowerCase() },
          { user_id: normalizedIdentifier },
        ],
      })
      .lean()
      .exec();

    return doc ? UserMapper.toDomain(doc as unknown as UserDocLike) : null;
  }

  async findRoleByName(name: string): Promise<{ _id: string } | null> {
    const role = await this.userModel.db.collection('roles').findOne({ name });
    return role ? { _id: role._id.toString() } : null;
  }

  async create(data: {
    email: string;
    userId: string;
    password: string;
    role: string;
    name?: string;
    loginType?: string;
  }): Promise<UserEntity> {
    const [doc] = await this.userModel.create([
      {
        email: data.email,
        user_id: data.userId,
        password: data.password,
        name: data.name ?? null,
        loginType: data.loginType ?? 'email',
        isActive: true,
        isVerified: false,
        roles: [data.role],
        deletedAt: null,
      },
    ]);
    return UserMapper.toDomain(doc.toObject() as UserDocLike);
  }
}

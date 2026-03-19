import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmailOrUserId(identifier: string): Promise<UserEntity | null>;
  findRoleByName(name: string): Promise<{ _id: string } | null>;
  create(data: {
    email: string;
    userId: string;
    role: string;
    name?: string;
    loginType?: string;
  }): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null>;
}

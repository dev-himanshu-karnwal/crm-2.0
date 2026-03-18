import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmailOrUserId(identifier: string): Promise<UserEntity | null>;
  create(data: {
    email: string;
    userId: string;
    password: string;
    name?: string;
  }): Promise<UserEntity>;
}

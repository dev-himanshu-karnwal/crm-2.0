import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

export interface UserDocLike {
  _id: { toString(): string };
  email: string;
  user_id: string;
  password?: string;
  name?: string | null;
  loginType: string;
  roles: { toString(): string }[];
  passwordUpdatedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper {
  static toDomain(doc: UserDocLike): UserEntity {
    return new UserEntity(
      doc._id.toString(),
      doc.email,
      doc.user_id,
      doc.name ?? null,
      (doc.roles || [])
        .filter((r) => r !== null && r !== undefined)
        .map((r) => r.toString()),
      doc.createdAt,
      doc.updatedAt,
      doc.passwordUpdatedAt,
      doc.deletedAt,
      doc.password,
    );
  }

  static toResponse(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.userId = entity.userId; // Added
    dto.name = entity.name;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly userId: string,
    public readonly name: string | null,
    public readonly roles: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly passwordUpdatedAt?: Date | null,
    public readonly deletedAt?: Date | null,
    public readonly password?: string,
  ) {}
}

import mongoose, { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { PermissionSchema } from '../../../modules/users/schemas/permission.schema';
import { RoleSchema } from '../../../modules/users/schemas/role.schema';
import { UserSchema } from '../../../modules/users/schemas/user.schema';

export type DataSource = Connection;

export async function createDataSource(): Promise<DataSource> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://mongo:27017/crm_2_0_mongo';
  const conn = mongoose.createConnection(uri);
  await conn.asPromise();
  return conn;
}

export async function closeDataSource(conn: DataSource): Promise<void> {
  await conn.close();
}

interface SeedPermission {
  key: string;
  description?: string | null;
}

interface SeedRole {
  name: string;
  description?: string | null;
  isSystem?: boolean;
  permissionKeys?: string[];
}

function getOrCreateModel<T>(
  conn: DataSource,
  name: string,
  schema: mongoose.Schema,
): mongoose.Model<T> {
  return (conn.models[name] ?? conn.model(name, schema)) as mongoose.Model<T>;
}

export async function seedPermissions(
  conn: DataSource,
  data: SeedPermission[],
): Promise<void> {
  const Permission = getOrCreateModel(conn, 'Permission', PermissionSchema);
  for (const item of data) {
    await Permission.findOneAndUpdate(
      { key: item.key },
      { $set: { key: item.key, description: item.description ?? null } },
      { upsert: true, new: true },
    );
  }
}

export async function seedRoles(
  conn: DataSource,
  data: SeedRole[],
): Promise<void> {
  const Role = getOrCreateModel(conn, 'Role', RoleSchema);
  const Permission = getOrCreateModel(conn, 'Permission', PermissionSchema);
  for (const item of data) {
    let permissionIds: mongoose.Types.ObjectId[] = [];
    if (item.permissionKeys?.length) {
      const perms = await Permission.find({
        key: { $in: item.permissionKeys },
      });
      permissionIds = perms.map((p: any) => p._id as mongoose.Types.ObjectId);
    }
    await Role.findOneAndUpdate(
      { name: item.name },
      {
        $set: {
          name: item.name,
          description: item.description ?? null,
          isSystem: item.isSystem ?? false,
          permissions: permissionIds,
        },
      },
      { upsert: true, new: true },
    );
  }
}

export async function seedSuperadmin(
  conn: DataSource,
  data: { name: string; email: string; password: string; userId: string },
  bcryptRounds = 10,
): Promise<void> {
  const User = getOrCreateModel(conn, 'User', UserSchema);
  const Role = getOrCreateModel(conn, 'Role', RoleSchema);

  const adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error('admin role not found - run seedRoles first');
  }

  const passwordHash = await bcrypt.hash(data.password, bcryptRounds);

  await User.findOneAndUpdate(
    { email: data.email },
    {
      $set: {
        email: data.email,
        user_id: data.userId,
        name: data.name,
        password: passwordHash,
        roles: [adminRole._id],
        deletedAt: null,
      },
    },
    { upsert: true, new: true },
  );
}

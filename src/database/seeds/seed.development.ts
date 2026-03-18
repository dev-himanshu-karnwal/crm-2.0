import {
  createDataSource,
  closeDataSource,
  seedPermissions,
  seedRoles,
  seedSuperadmin,
} from './common/seed-helpers';
import { PERMISSIONS, ROLES, SUPERADMIN } from './seed-data';

async function run(): Promise<void> {
  console.log('Seeding development database...');
  const conn = await createDataSource();
  try {
    await seedPermissions(conn, PERMISSIONS);
    console.log('  ✓ Permissions');
    await seedRoles(conn, ROLES);
    console.log('  ✓ Roles');
    await seedSuperadmin(conn, SUPERADMIN);
    console.log('  ✓ Superadmin account');
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed execution error:', err);
    throw err;
  } finally {
    await closeDataSource(conn);
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

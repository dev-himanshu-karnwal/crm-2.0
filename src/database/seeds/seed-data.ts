import { REGISTRATION_TYPE } from '../../modules/users/enums/registration-type.enum';

/**
 * Seed data: permissions, roles, and initial admin account.
 */

export const PERMISSIONS = [
  {
    key: 'user.manage.all',
    description: 'Full access to all user operations (Admin)',
  },
  {
    key: 'user.manage.staff',
    description: 'Access to manage employees, interns, and contractors (HR)',
  },
  {
    key: 'user.profile.read',
    description: 'Access to read own profile data',
  },
];

export const ROLES = [
  {
    name: 'admin',
    description: 'System Administrator with full access',
    isSystem: true,
    permissionKeys: ['user.manage.all', 'user.profile.read'],
  },
  {
    name: REGISTRATION_TYPE.HR,
    description: 'Human Resources role',
    isSystem: true,
    permissionKeys: ['user.manage.staff', 'user.profile.read'],
  },
  {
    name: REGISTRATION_TYPE.EMPLOYEE,
    description: 'Standard Employee role',
    isSystem: true,
    permissionKeys: ['user.profile.read'],
  },
  {
    name: REGISTRATION_TYPE.INTERN,
    description: 'Intern role',
    isSystem: true,
    permissionKeys: ['user.profile.read'],
  },
  {
    name: REGISTRATION_TYPE.CONTRACTOR,
    description: 'Contractor role',
    isSystem: true,
    permissionKeys: ['user.profile.read'],
  },
];

export const SUPERADMIN = {
  userId: 'DCTEMP123',
  name: 'Himanshu',
  email: 'himanshukar1810@gmail.com',
  password: 'Admin@123',
};

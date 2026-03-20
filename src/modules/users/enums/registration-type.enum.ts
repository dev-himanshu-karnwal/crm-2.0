export const REGISTRATION_TYPE = {
  HR: 'hr',
  EMPLOYEE: 'employee',
  INTERN: 'intern',
  CONTRACTOR: 'contractor',
} as const;

export type RegistrationType =
  (typeof REGISTRATION_TYPE)[keyof typeof REGISTRATION_TYPE];

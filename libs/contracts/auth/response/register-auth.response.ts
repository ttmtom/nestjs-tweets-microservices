import { UserRole } from '@libs/contracts/auth/types/user-role.type';

export type RegisterAuthResponse = {
  userId: string;
  role: UserRole;
};

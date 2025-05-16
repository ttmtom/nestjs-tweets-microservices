import { EUserRole } from '@libs/contracts/auth/enums';

export type LoginAuthResponse = {
  userId: string;
  role: EUserRole;
  token: string;
};

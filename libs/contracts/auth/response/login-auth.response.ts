import { EUserRole } from '@libs/contracts/auth/enums';

export type TLoginAuthResponse = {
  userId: string;
  role: EUserRole;
  token: string;
};

import { EUserRole } from '@libs/contracts/auth/enums';

export type TRegisterAuthResponse = {
  userId: string;
  role: EUserRole;
};

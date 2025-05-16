import { EUserRole } from '@libs/contracts/auth/enums';

export interface IJwtPayload {
  sub: string;
  username: string;
  role: EUserRole;
}

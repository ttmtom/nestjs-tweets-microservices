import { EUserRole } from '@libs/contracts/auth/enums';

export interface IJwtPayload {
  sub: string;
  idHash: string;
  username: string;
  role: EUserRole;
}

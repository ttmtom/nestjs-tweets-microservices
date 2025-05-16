import { EUserRole } from '@libs/contracts/auth/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);

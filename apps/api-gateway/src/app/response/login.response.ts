import { EUserRole } from '@libs/contracts/auth/enums';

export class LoginResponse {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    role: EUserRole;
    createdAt: Date;
    updatedAt: Date;
  };

  token: string;

  constructor() {}
}

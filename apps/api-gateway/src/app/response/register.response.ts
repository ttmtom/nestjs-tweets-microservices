import { EUserRole } from '@libs/contracts/auth/enums';
import { TRegisterAuthResponse } from '@libs/contracts/auth/response';
import { TRegisterUserResponse } from '@libs/contracts/users/response';

export class RegisterResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  role: EUserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(userRes: TRegisterUserResponse, authRes: TRegisterAuthResponse) {
    this.id = userRes.idHash;
    this.username = userRes.username;
    this.firstName = userRes.firstName;
    this.lastName = userRes.lastName;
    this.dateOfBirth = userRes.dateOfBirth;
    this.role = authRes.role;
    this.createdAt = userRes.createdAt;
    this.updatedAt = userRes.updatedAt;
  }
}

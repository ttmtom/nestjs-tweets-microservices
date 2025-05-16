import { EUserRole } from '@libs/contracts/auth/enums';
import { IsNotEmpty } from 'class-validator';

export class RegisterAuthDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  password: string;

  role?: EUserRole;
}

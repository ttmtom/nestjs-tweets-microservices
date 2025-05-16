import { IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  idHash: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

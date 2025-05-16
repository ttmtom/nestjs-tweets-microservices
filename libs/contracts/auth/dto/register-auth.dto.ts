import { IsNotEmpty } from 'class-validator';

export class RegisterAuthDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  password: string;
}

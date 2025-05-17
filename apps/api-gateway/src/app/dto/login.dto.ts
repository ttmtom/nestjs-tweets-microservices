import { Trim } from '@libs/contracts/general/decorator/trim.decorator';
import { IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @Matches(/^[a-zA-Z]([a-zA-Z0-9])*$/, {
    message:
      'Username must start with a letter and can only contain letters and numbers.',
  })
  @Trim()
  username: string;

  @IsNotEmpty()
  password: string;
}

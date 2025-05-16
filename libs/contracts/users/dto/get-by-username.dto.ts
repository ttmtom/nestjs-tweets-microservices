import { Matches } from 'class-validator';

export class GetByUsernameDto {
  @Matches(/^[a-zA-Z]([a-zA-Z0-9])*$/, {
    message:
      'Username must start with a letter and can only contain letters and numbers.',
  })
  username: string;

  constructor(username: string) {
    this.username = username;
  }
}

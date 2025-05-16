import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, Matches, MaxDate, MinDate } from 'class-validator';

export class RegisterUserDto {
  @Matches(/^[a-zA-Z]([a-zA-Z0-9])*$/, {
    message:
      'Username must start with a letter and can only contain letters and numbers.',
  })
  username: string;

  @IsNotEmpty({ message: 'First name cannot be blank.' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name cannot be blank.' })
  lastName: string;

  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be a valid date.' })
  @MinDate(
    () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 70);
      return date;
    },
    {
      message: 'User cannot be more than 70 years old.',
    },
  )
  @MaxDate(
    () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 14);
      return date;
    },
    {
      message: 'User cannot be younger than 14 years old.',
    },
  )
  dateOfBirth: Date;

  constructor(
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
  }
}

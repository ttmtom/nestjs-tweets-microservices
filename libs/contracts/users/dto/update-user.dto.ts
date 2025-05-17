import { Trim } from '@libs/contracts/general/decorator';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  MaxDate,
  MinDate,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @Trim()
  idHash: string;

  @IsOptional()
  @Trim()
  firstName?: string;

  @IsOptional()
  @Trim()
  lastName?: string;

  @Type(() => Date)
  @IsOptional()
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
  dateOfBirth?: Date;
}

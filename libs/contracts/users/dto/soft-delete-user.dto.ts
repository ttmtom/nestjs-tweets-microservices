import { IsString } from 'class-validator';

export class SoftDeleteUserDto {
  @IsString()
  idHash: string;
}

import { IsString } from 'class-validator';

export class GetByIdHashDto {
  @IsString()
  idHash: string;
}

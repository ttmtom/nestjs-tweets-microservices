import { IsNotEmpty } from 'class-validator';

export class SoftDeleteTweetDto {
  @IsNotEmpty()
  id: string;
}

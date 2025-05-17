import { IsNotEmpty } from 'class-validator';

export class GetTweetDto {
  @IsNotEmpty()
  id: string;
}

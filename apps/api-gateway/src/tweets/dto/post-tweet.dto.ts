import { Trim } from '@libs/contracts/general/decorator';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class PostTweetDto {
  @IsNotEmpty()
  @Trim()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @Trim()
  @MaxLength(800)
  content: string;
}

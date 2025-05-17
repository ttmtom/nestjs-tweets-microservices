import { IsNotEmpty } from 'class-validator';

export class SoftDeleteTweetByAuthorDto {
  @IsNotEmpty()
  authorId: string;
}

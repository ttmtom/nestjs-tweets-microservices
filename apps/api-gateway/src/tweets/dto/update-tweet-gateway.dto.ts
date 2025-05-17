import { Trim } from '@libs/contracts/general/decorator';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateTweetGatewayDto {
  @IsNotEmpty()
  @IsOptional()
  @Trim()
  @MaxLength(100)
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  @Trim()
  @MaxLength(800)
  content?: string;

  get atLeastOne(): boolean {
    return !!this.title || !!this.content;
  }
}

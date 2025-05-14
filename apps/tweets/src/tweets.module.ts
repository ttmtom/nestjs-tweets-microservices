import { Module } from '@nestjs/common';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

@Module({
  imports: [],
  controllers: [TweetsController],
  providers: [TweetsService],
})
export class TweetsModule {}

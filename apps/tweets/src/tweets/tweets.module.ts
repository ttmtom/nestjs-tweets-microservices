import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../database/entities';
import { TweetsController } from './tweets.controller';
import { TweetsRepository } from './tweets.repository';
import { TweetsService } from './tweets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet])],
  controllers: [TweetsController],
  providers: [TweetsRepository, TweetsService],
})
export class TweetsModule {}

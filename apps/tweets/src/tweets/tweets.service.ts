import { CreateTweetDto } from '@libs/contracts/tweets/dto/create-tweet.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Tweet } from '../database/entities';
import { TweetsRepository } from './tweets.repository';

@Injectable()
export class TweetsService {
  constructor(
    @Inject()
    private readonly repository: TweetsRepository,
  ) {}

  createNewTweet(createTweetDto: CreateTweetDto) {
    const tweet = new Tweet(
      createTweetDto.title,
      createTweetDto.content,
      createTweetDto.authorId,
    );
    return this.repository.insert(tweet);
  }
}

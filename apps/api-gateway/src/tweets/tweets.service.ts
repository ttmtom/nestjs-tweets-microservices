import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import { CreateTweetDto, GetTweetsDto } from '@libs/contracts/tweets/dto';
import {
  TCreateTweetResponse,
  TGetTweetsResponse,
} from '@libs/contracts/tweets/response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendEvent } from '../common/helper/send-event';
import { PostTweetDto } from './dto/post-tweet.dto';

@Injectable()
export class TweetsService {
  private readonly logger = new Logger(TweetsService.name);
  constructor(
    @Inject(SERVICE_LIST.TWEETS_SERVICE)
    private readonly tweetsClient: ClientProxy,
  ) {}

  async getTweets(paginationDto: PaginationDto) {
    const tweetsRes = await sendEvent<TGetTweetsResponse, GetTweetsDto>(
      this.tweetsClient,
      TWEETS_PATTERN.GET_TWEETS,
      paginationDto,
      this.logger,
    );

    return tweetsRes.data;
  }

  async postTweet(postTweetDto: PostTweetDto, userId: string) {
    const tweetRes = await sendEvent<TCreateTweetResponse, CreateTweetDto>(
      this.tweetsClient,
      TWEETS_PATTERN.CREATE_TWEET,
      {
        ...postTweetDto,
        authorId: userId,
      },
      this.logger,
    );

    return tweetRes.data;
  }
}

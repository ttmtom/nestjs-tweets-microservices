import { PaginationDto } from '@libs/contracts/general/dto';
import { EventResponseWrapperInterceptor } from '@libs/contracts/general/event-response-wrapper-interceptor';
import { GetTweetDto } from '@libs/contracts/tweets/dto';
import { CreateTweetDto } from '@libs/contracts/tweets/dto/create-tweet.dto';
import {
  TCreateTweetResponse,
  TGetTweetResponse,
  TGetTweetsResponse,
} from '@libs/contracts/tweets/response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TweetsService } from './tweets.service';

@Controller()
export class TweetsController {
  private readonly logger = new Logger(TweetsController.name);

  constructor(private readonly tweetsService: TweetsService) {}

  @MessagePattern(TWEETS_PATTERN.CREATE_TWEET)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async createNewTweet(
    @Payload() createTweetDto: CreateTweetDto,
  ): Promise<TCreateTweetResponse> {
    this.logger.log(
      `event: ${TWEETS_PATTERN.CREATE_TWEET}: ${createTweetDto.authorId}`,
    );
    const newTweet = await this.tweetsService.createNewTweet(createTweetDto);
    return newTweet;
  }

  @MessagePattern(TWEETS_PATTERN.GET_TWEETS)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getTweets(
    @Payload() paginationDto: PaginationDto,
  ): Promise<TGetTweetsResponse> {
    this.logger.log(`event: ${TWEETS_PATTERN.GET_TWEETS}`);
    const paginationData = await this.tweetsService.getTweets(paginationDto);

    return paginationData;
  }

  @MessagePattern(TWEETS_PATTERN.GET_TWEET)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getTweet(
    @Payload() getTweetDto: GetTweetDto,
  ): Promise<TGetTweetResponse> {
    this.logger.log(`event: ${TWEETS_PATTERN.GET_TWEET}`);
    const tweet = await this.tweetsService.getTweet(getTweetDto);

    return tweet;
  }
}

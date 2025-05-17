import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import { EventResponseWrapperInterceptor } from '@libs/contracts/general/event-response-wrapper-interceptor';
import {
  GetTweetDto,
  SoftDeleteTweetByAuthorDto,
  SoftDeleteTweetDto,
} from '@libs/contracts/tweets/dto';
import { CreateTweetDto } from '@libs/contracts/tweets/dto/create-tweet.dto';
import {
  TCreateTweetResponse,
  TGetTweetResponse,
  TGetTweetsResponse,
} from '@libs/contracts/tweets/response';
import { TSoftDeleteTweetResponse } from '@libs/contracts/tweets/response/soft-delete-tweet.response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import {
  Controller,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
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
    this.logger.log(`event: ${TWEETS_PATTERN.GET_TWEET} ${getTweetDto.id}`);
    const tweet = await this.tweetsService.getTweet(getTweetDto.id);

    if (!tweet) {
      throw new NotFoundException({
        message: 'Tweet not found',
        code: ERROR_LIST.TWEET_NOT_FOUND,
      });
    }
    return tweet;
  }

  @MessagePattern(TWEETS_PATTERN.SOFT_DELETE_TWEET)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async softDeleteTweet(
    @Payload() softDeleteTweetDto: SoftDeleteTweetDto,
  ): Promise<TSoftDeleteTweetResponse> {
    this.logger.log(`event: ${TWEETS_PATTERN.SOFT_DELETE_TWEET}`);
    const tweet = await this.tweetsService.softDelete(softDeleteTweetDto.id);

    return {
      success: !!tweet.deletedAt,
    };
  }

  @MessagePattern(TWEETS_PATTERN.SOFT_DELETE_TWEET_BY_AUTHOR)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async softDeleteTweetByAuthor(
    @Payload() softDeleteTweetByAuthorDto: SoftDeleteTweetByAuthorDto,
  ): Promise<void> {
    this.logger.log(`event: ${TWEETS_PATTERN.SOFT_DELETE_TWEET_BY_AUTHOR}`);
    await this.tweetsService.softDeleteByAuthor(
      softDeleteTweetByAuthorDto.authorId,
    );
  }
}

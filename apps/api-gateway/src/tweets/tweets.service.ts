import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  CreateTweetDto,
  GetTweetDto,
  GetTweetsDto,
  SoftDeleteTweetDto,
  UpdateTweetDto,
} from '@libs/contracts/tweets/dto';
import {
  TCreateTweetResponse,
  TGetTweetResponse,
  TGetTweetsResponse,
  TUpdateTweetResponse,
} from '@libs/contracts/tweets/response';
import { TSoftDeleteTweetResponse } from '@libs/contracts/tweets/response/soft-delete-tweet.response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import { GetUserByIdDto } from '@libs/contracts/users/dto';
import { TGetUserByIdResponse } from '@libs/contracts/users/response/get-username.response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendEvent } from '../common/helper/send-event';
import { UpdateTweetGatewayDto } from './dto';
import { PostTweetDto } from './dto/post-tweet.dto';

@Injectable()
export class TweetsService {
  private readonly logger = new Logger(TweetsService.name);

  constructor(
    @Inject(SERVICE_LIST.TWEETS_SERVICE)
    private readonly tweetsClient: ClientProxy,
    @Inject(SERVICE_LIST.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
  ) {}

  async getTweets(paginationDto: PaginationDto) {
    const tweetsRes = await sendEvent<TGetTweetsResponse, GetTweetsDto>(
      this.tweetsClient,
      TWEETS_PATTERN.GET_TWEETS,
      paginationDto,
      this.logger,
    );
    const users = new Map<string, TGetUserByIdResponse>();

    for (const tweet of tweetsRes.data.data) {
      if (users.has(tweet.authorId)) {
        continue;
      }
      const userRes = await sendEvent<TGetUserByIdResponse, GetUserByIdDto>(
        this.usersClient,
        USERS_PATTERN.GET_USERNAME_BY_ID,
        { id: tweet.authorId },
        this.logger,
      );

      users.set(tweet.authorId, userRes.data);
    }

    return { tweetsData: tweetsRes.data, users };
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

  async getTweet(id: string) {
    const tweetRes = await sendEvent<TGetTweetResponse, GetTweetDto>(
      this.tweetsClient,
      TWEETS_PATTERN.GET_TWEET,
      { id },
      this.logger,
    );

    const { data: tweet } = tweetRes;
    const userRes = await sendEvent<TGetUserByIdResponse, GetUserByIdDto>(
      this.usersClient,
      USERS_PATTERN.GET_USERNAME_BY_ID,
      { id: tweet.authorId },
      this.logger,
    );

    return { tweet, author: userRes.data };
  }

  async softDeleteTweet(id: string, user: IJwtPayload) {
    const tweetRes = await sendEvent<TGetTweetResponse, GetTweetDto>(
      this.tweetsClient,
      TWEETS_PATTERN.GET_TWEET,
      { id },
      this.logger,
    );

    const { data: tweet } = tweetRes;
    if (tweet.authorId !== user.sub && user.role !== EUserRole.ADMIN) {
      throw new ForbiddenException({
        message: 'Forbidden',
        code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
      });
    }

    const deleteRes = await sendEvent<
      TSoftDeleteTweetResponse,
      SoftDeleteTweetDto
    >(this.tweetsClient, TWEETS_PATTERN.SOFT_DELETE_TWEET, { id }, this.logger);

    return deleteRes;
  }

  async updateTweet(
    updateTweetDto: UpdateTweetGatewayDto,
    id: string,
    user: IJwtPayload,
  ) {
    const tweet = await this.getTweet(id);
    if (tweet.author.id !== user.sub && user.role !== EUserRole.ADMIN) {
      throw new ForbiddenException({
        message: 'Forbidden',
        code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
      });
    }

    const updateRes = await sendEvent<TUpdateTweetResponse, UpdateTweetDto>(
      this.tweetsClient,
      TWEETS_PATTERN.UPDATE_TWEET,
      { ...updateTweetDto, id },
      this.logger,
    );

    return { tweet: updateRes.data, author: tweet.author };
  }
}

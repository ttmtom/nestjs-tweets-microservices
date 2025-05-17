import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ErrorResponse, SuccessResponse } from '@libs/contracts/general/dto';
import { CreateTweetDto } from '@libs/contracts/tweets/dto';
import { TCreateTweetResponse } from '@libs/contracts/tweets/response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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

  async postTweet(postTweetDto: PostTweetDto, userId: string) {
    let tweetRes: SuccessResponse<TCreateTweetResponse>;
    try {
      tweetRes = await firstValueFrom(
        this.tweetsClient.send<
          SuccessResponse<TCreateTweetResponse>,
          CreateTweetDto
        >(TWEETS_PATTERN.CREATE_TWEET, {
          ...postTweetDto,
          authorId: userId,
        }),
      );
    } catch (error) {
      this.logger.error(
        'Error from TWEETS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return tweetRes.data;
  }
}

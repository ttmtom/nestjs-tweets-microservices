import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles, User } from '../common/decorators';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PostTweetDto } from './dto/post-tweet.dto';
import { TweetsService } from './tweets.service';

@Controller('/tweets')
export class TweetsController {
  private readonly logger = new Logger(TweetsController.name);

  constructor(
    @Inject()
    private readonly tweetsService: TweetsService,
  ) {}

  @Get()
  @UseGuards(ApiGatewayAuthGuard)
  async getTweets(): Promise<string> {
    return 'Hello World!';
  }

  @Get(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async getTweetById(id: string): Promise<string> {
    return `Tweet with id ${id}`;
  }

  @Post()
  @UseGuards(ApiGatewayAuthGuard)
  async createTweet(
    @Body() postTweetDto: PostTweetDto,
    @User() user: IJwtPayload,
  ) {
    this.logger.log(`post tweet ${user.username}`);
    const tweet = await this.tweetsService.postTweet(postTweetDto, user.sub);
    return {
      id: tweet.id,
      authorId: tweet.authorId,
      title: tweet.title,
      content: tweet.content,
    };
  }

  @Put(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async updateTweet() {}

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async deleteTweets() {}
}

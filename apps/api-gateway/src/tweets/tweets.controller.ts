import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles, User } from '../common/decorators';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PostTweetDto, UpdateTweetGatewayDto } from './dto';
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
  async getTweets(@Query() paginationDto: PaginationDto) {
    const { tweetsData, users } =
      await this.tweetsService.getTweets(paginationDto);
    return {
      ...tweetsData,
      data: tweetsData.data.map((tweet) => ({
        id: tweet.id,
        title: tweet.title,
        content: tweet.content,
        updatedAt: tweet.updatedAt,
        createdAt: tweet.createdAt,
        own: {
          userId: users.get(tweet.authorId).idHash,
          username: users.get(tweet.authorId).username,
        },
      })),
    };
  }

  @Get(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async getTweetById(@Param('id') id: string) {
    this.logger.log(`Getting tweet with id ${id}`);
    const { tweet, author } = await this.tweetsService.getTweet(id);
    return {
      id: tweet.id,
      title: tweet.title,
      content: tweet.content,
      updatedAt: tweet.updatedAt,
      createdAt: tweet.createdAt,
      own: {
        userId: author.idHash,
        username: author.username,
      },
    };
  }

  @Post()
  @UseGuards(ApiGatewayAuthGuard)
  async createTweet(
    @Body() postTweetDto: PostTweetDto,
    @User() user: IJwtPayload,
  ) {
    this.logger.log(`post tweet username: ${user.username}`);
    const tweet = await this.tweetsService.postTweet(postTweetDto, user.sub);
    return {
      id: tweet.id,
      authorId: tweet.authorId,
      title: tweet.title,
      content: tweet.content,
      updatedAt: tweet.updatedAt,
      createdAt: tweet.createdAt,
      own: {
        userId: user.idHash,
        username: user.username,
      },
    };
  }

  @Put(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async updateTweet(
    @Param('id') id: string,
    @User() user: IJwtPayload,
    @Body() updateTweetGatewayDto: UpdateTweetGatewayDto,
  ) {
    this.logger.log(`Update tweet with id ${id}`);
    if (
      Object.keys(updateTweetGatewayDto).length === 0 ||
      !updateTweetGatewayDto.atLeastOne
    ) {
      throw new BadRequestException({
        message: 'No data provided',
        code: ERROR_LIST.APIGATEWAY_NO_DATA_PROVIDED,
      });
    }

    const { tweet, author } = await this.tweetsService.updateTweet(
      updateTweetGatewayDto,
      id,
      user,
    );

    return {
      id: tweet.id,
      authorId: tweet.authorId,
      title: tweet.title,
      content: tweet.content,
      updatedAt: tweet.updatedAt,
      createdAt: tweet.createdAt,
      own: {
        userId: author.idHash,
        username: author.username,
      },
    };
  }

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async deleteTweets(@Param('id') id: string, @User() user: IJwtPayload) {
    this.logger.log(`Deleting tweet with id ${id}`);
    await this.tweetsService.softDeleteTweet(id, user);
  }
}

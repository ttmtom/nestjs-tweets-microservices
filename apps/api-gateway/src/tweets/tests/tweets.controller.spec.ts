import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostTweetDto, UpdateTweetGatewayDto } from '../dto';
import { TweetsController } from '../tweets.controller';
import { TweetsService } from '../tweets.service';

describe('TweetsController', () => {
  let controller: TweetsController;
  let service: TweetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetsController],
      providers: [
        {
          provide: TweetsService,
          useValue: {
            getTweets: jest.fn(),
            getTweet: jest.fn(),
            postTweet: jest.fn(),
            updateTweet: jest.fn(),
            softDeleteTweet: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.AUTH_SERVICE,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SERVICE_LIST.USERS_SERVICE,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<TweetsController>(TweetsController);
    service = module.get<TweetsService>(TweetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTweets', () => {
    it('should return tweets with formatted data', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const tweetsData = {
        data: [
          {
            id: 'tweet1',
            title: 'Tweet 1',
            content: 'Content 1',
            authorId: 'user1',
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      const users = new Map([
        ['user1', { idHash: 'user1Hash', username: 'user1name' }],
      ]);
      (service.getTweets as jest.Mock).mockResolvedValue({ tweetsData, users });

      const result = await controller.getTweets(paginationDto);

      expect(service.getTweets).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual({
        ...tweetsData,
        data: [
          {
            id: 'tweet1',
            title: 'Tweet 1',
            content: 'Content 1',
            updatedAt: tweetsData.data[0].updatedAt,
            createdAt: tweetsData.data[0].createdAt,
            own: { userId: 'user1Hash', username: 'user1name' },
          },
        ],
      });
    });
  });

  describe('getTweetById', () => {
    it('should return a tweet with formatted data', async () => {
      const tweetId = 'tweet1';
      const tweet = {
        id: 'tweet1',
        title: 'Tweet 1',
        content: 'Content 1',
        authorId: 'user1',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const author = { idHash: 'user1Hash', username: 'user1name' };
      (service.getTweet as jest.Mock).mockResolvedValue({ tweet, author });

      const result = await controller.getTweetById(tweetId);

      expect(service.getTweet).toHaveBeenCalledWith(tweetId);
      expect(result).toEqual({
        id: 'tweet1',
        title: 'Tweet 1',
        content: 'Content 1',
        updatedAt: tweet.updatedAt,
        createdAt: tweet.createdAt,
        own: { userId: 'user1Hash', username: 'user1name' },
      });
    });
  });

  describe('createTweet', () => {
    it('should create a tweet and return formatted data', async () => {
      const postTweetDto: PostTweetDto = {
        title: 'New Tweet',
        content: 'New Content',
      };
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };
      const createdTweet = {
        id: 'newTweet',
        authorId: 'user1',
        title: 'New Tweet',
        content: 'New Content',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      (service.postTweet as jest.Mock).mockResolvedValue(createdTweet);

      const result = await controller.createTweet(postTweetDto, user);

      expect(service.postTweet).toHaveBeenCalledWith(postTweetDto, user.sub);
      expect(result).toEqual({
        id: 'newTweet',
        authorId: 'user1',
        title: 'New Tweet',
        content: 'New Content',
        updatedAt: createdTweet.updatedAt,
        createdAt: createdTweet.createdAt,
        own: { userId: 'user1Hash', username: 'user1name' },
      });
    });
  });

  describe('updateTweet', () => {
    it('should update a tweet and return formatted data', async () => {
      const tweetId = 'tweet1';
      const updateTweetGatewayDto: UpdateTweetGatewayDto = {
        title: 'Updated Tweet',
        atLeastOne: true,
      };
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };
      const updatedTweet = {
        id: 'tweet1',
        authorId: 'user1',
        title: 'Updated Tweet',
        content: 'Content 1',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const author = { idHash: 'user1Hash', username: 'user1name' };
      (service.updateTweet as jest.Mock).mockResolvedValue({
        tweet: updatedTweet,
        author,
      });

      const result = await controller.updateTweet(
        tweetId,
        user,
        updateTweetGatewayDto,
      );

      expect(service.updateTweet).toHaveBeenCalledWith(
        updateTweetGatewayDto,
        tweetId,
        user,
      );
      expect(result).toEqual({
        id: 'tweet1',
        authorId: 'user1',
        title: 'Updated Tweet',
        content: 'Content 1',
        updatedAt: updatedTweet.updatedAt,
        createdAt: updatedTweet.createdAt,
        own: { userId: 'user1Hash', username: 'user1name' },
      });
    });

    it('should throw BadRequestException if no data is provided', async () => {
      const tweetId = 'tweet1';
      const updateTweetGatewayDto: UpdateTweetGatewayDto = {
        atLeastOne: false,
      };
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      await expect(
        controller.updateTweet(tweetId, user, updateTweetGatewayDto),
      ).rejects.toThrowError(
        new BadRequestException({
          message: 'No data provided',
          code: ERROR_LIST.APIGATEWAY_NO_DATA_PROVIDED,
        }),
      );
      expect(service.updateTweet).not.toHaveBeenCalled();
    });
  });

  describe('deleteTweets', () => {
    it('should call softDeleteTweet with correct parameters', async () => {
      const tweetId = 'tweet1';
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      await controller.deleteTweets(tweetId, user);

      expect(service.softDeleteTweet).toHaveBeenCalledWith(tweetId, user);
    });
  });
});

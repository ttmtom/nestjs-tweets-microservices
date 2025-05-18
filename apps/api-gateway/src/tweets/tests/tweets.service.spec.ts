import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  TCreateTweetResponse,
  TGetTweetResponse,
  TGetTweetsResponse,
  TSoftDeleteTweetResponse,
  TUpdateTweetResponse,
} from '@libs/contracts/tweets/response';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import { TGetUserByIdResponse } from '@libs/contracts/users/response';
import { ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { PostTweetDto, UpdateTweetGatewayDto } from '../dto';
import { TweetsService } from '../tweets.service';

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetsClient: ClientProxy;
  let usersClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: SERVICE_LIST.TWEETS_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.USERS_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetsClient = module.get<ClientProxy>(SERVICE_LIST.TWEETS_SERVICE);
    usersClient = module.get<ClientProxy>(SERVICE_LIST.USERS_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTweets', () => {
    it('should return tweets and users', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockTweetsResponse: TGetTweetsResponse = {
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
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      const mockUserResponse: TGetUserByIdResponse = {
        id: 'user1',
        idHash: 'user1Hash',
        username: 'user1name',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (tweetsClient.send as jest.Mock).mockReturnValue(
        of({ data: mockTweetsResponse }),
      );
      (usersClient.send as jest.Mock).mockReturnValue(
        of({ data: mockUserResponse }),
      );

      const result = await service.getTweets(paginationDto);

      expect(tweetsClient.send).toHaveBeenCalled();
      expect(usersClient.send).toHaveBeenCalled();
      expect(result).toEqual({
        tweetsData: mockTweetsResponse,
        users: new Map([['user1', mockUserResponse]]),
      });
    });
  });

  describe('postTweet', () => {
    it('should post a tweet', async () => {
      const postTweetDto: PostTweetDto = {
        title: 'New Tweet',
        content: 'New Content',
      };
      const userId = 'user1';
      const mockTweetResponse: TCreateTweetResponse = {
        id: 'newTweet',
        authorId: userId,
        title: 'New Tweet',
        content: 'New Content',
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      (tweetsClient.send as jest.Mock).mockReturnValue(
        of({ data: mockTweetResponse }),
      );

      const result = await service.postTweet(postTweetDto, userId);

      expect(tweetsClient.send).toHaveBeenCalled();
      expect(result).toEqual(mockTweetResponse);
    });
  });

  describe('getTweet', () => {
    it('should return a tweet and its author', async () => {
      const tweetId = 'tweet1';
      const mockTweetResponse: TGetTweetResponse = {
        id: tweetId,
        title: 'Tweet 1',
        content: 'Content 1',
        authorId: 'user1',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const mockUserResponse: TGetUserByIdResponse = {
        id: 'user1',
        idHash: 'user1Hash',
        username: 'user1name',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (tweetsClient.send as jest.Mock).mockReturnValue(
        of({ data: mockTweetResponse }),
      );
      (usersClient.send as jest.Mock).mockReturnValue(
        of({ data: mockUserResponse }),
      );

      const result = await service.getTweet(tweetId);

      expect(tweetsClient.send).toHaveBeenCalled();
      expect(usersClient.send).toHaveBeenCalled();
      expect(result).toEqual({
        tweet: mockTweetResponse,
        author: mockUserResponse,
      });
    });
  });

  describe('softDeleteTweet', () => {
    const tweetId = 'tweet1';
    const mockTweetResponse: TGetTweetResponse = {
      id: tweetId,
      title: 'Tweet 1',
      content: 'Content 1',
      authorId: 'user1',
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const mockDeleteResponse: TSoftDeleteTweetResponse = { success: true };

    beforeEach(() => {
      (tweetsClient.send as jest.Mock).mockImplementation((pattern) => {
        if (pattern === TWEETS_PATTERN.GET_TWEET) {
          return of({ data: mockTweetResponse });
        } else if (pattern === TWEETS_PATTERN.SOFT_DELETE_TWEET) {
          return of(mockDeleteResponse);
        }
      });
    });

    it('should soft delete a tweet if the user is the author', async () => {
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      const result = await service.softDeleteTweet(tweetId, user);

      expect(tweetsClient.send).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should soft delete a tweet if the user is an admin', async () => {
      const adminUser: IJwtPayload = {
        sub: 'admin1',
        username: 'admin1name',
        role: EUserRole.ADMIN,
        idHash: 'admin1Hash',
      };

      const result = await service.softDeleteTweet(tweetId, adminUser);

      expect(tweetsClient.send).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should throw ForbiddenException if the user is not the author or an admin', async () => {
      const otherUser: IJwtPayload = {
        sub: 'user2',
        username: 'user2name',
        role: EUserRole.USER,
        idHash: 'user2Hash',
      };

      await expect(
        service.softDeleteTweet(tweetId, otherUser),
      ).rejects.toThrowError(
        new ForbiddenException({
          message: 'Forbidden',
          code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
        }),
      );
      expect(tweetsClient.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTweet', () => {
    const tweetId = 'tweet1';
    const mockAuthor = {
      id: 'user1',
      idHash: 'user1Hash',
      username: 'user1name',
    };
    const mockTweetResponse: TGetTweetResponse = {
      id: tweetId,
      title: 'Tweet 1',
      content: 'Content 1',
      authorId: 'user1',
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const mockUpdateResponse: TUpdateTweetResponse = {
      id: tweetId,
      title: 'Updated Tweet',
      content: 'Content 1',
      authorId: 'user1',
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    beforeEach(() => {
      (tweetsClient.send as jest.Mock).mockImplementation((pattern) => {
        if (pattern === TWEETS_PATTERN.GET_TWEET) {
          return of({ data: mockTweetResponse });
        } else if (pattern === TWEETS_PATTERN.UPDATE_TWEET) {
          return of({ data: mockUpdateResponse });
        }
      });
      (usersClient.send as jest.Mock).mockReturnValue(of({ data: mockAuthor }));
    });

    it('should update a tweet if the user is the author', async () => {
      const updateTweetDto: UpdateTweetGatewayDto = {
        title: 'Updated Tweet',
        atLeastOne: true,
      };
      const user: IJwtPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      const result = await service.updateTweet(updateTweetDto, tweetId, user);

      expect(tweetsClient.send).toHaveBeenCalledTimes(2);
      expect(usersClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ tweet: mockUpdateResponse, author: mockAuthor });
    });

    it('should update a tweet if the user is an admin', async () => {
      const updateTweetDto: UpdateTweetGatewayDto = {
        title: 'Updated Tweet',
        atLeastOne: true,
      };
      const adminUser: IJwtPayload = {
        sub: 'admin1',
        username: 'admin1name',
        role: EUserRole.ADMIN,
        idHash: 'admin1Hash',
      };

      const result = await service.updateTweet(
        updateTweetDto,
        tweetId,
        adminUser,
      );

      expect(tweetsClient.send).toHaveBeenCalledTimes(2);
      expect(usersClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ tweet: mockUpdateResponse, author: mockAuthor });
    });

    it('should throw ForbiddenException if the user is not the author or an admin', async () => {
      const updateTweetDto: UpdateTweetGatewayDto = {
        title: 'Updated Tweet',
        atLeastOne: true,
      };
      const otherUser: IJwtPayload = {
        sub: 'user2',
        username: 'user2name',
        role: EUserRole.USER,
        idHash: 'user2Hash',
      };

      await expect(
        service.updateTweet(updateTweetDto, tweetId, otherUser),
      ).rejects.toThrowError(
        new ForbiddenException({
          message: 'Forbidden',
          code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
        }),
      );
      expect(tweetsClient.send).toHaveBeenCalledTimes(1);
      expect(usersClient.send).toHaveBeenCalledTimes(1);
    });
  });
});

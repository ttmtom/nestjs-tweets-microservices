import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  CreateTweetDto,
  GetTweetDto,
  SoftDeleteTweetByAuthorDto,
  SoftDeleteTweetDto,
  UpdateTweetDto,
} from '@libs/contracts/tweets/dto';
import {
  TCreateTweetResponse,
  TGetTweetResponse,
  TGetTweetsResponse,
  TUpdateTweetResponse,
} from '@libs/contracts/tweets/response';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
            createNewTweet: jest.fn(),
            getTweets: jest.fn(),
            getTweet: jest.fn(),
            softDelete: jest.fn(),
            softDeleteByAuthor: jest.fn(),
            updateTweet: jest.fn(),
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

  describe('createNewTweet', () => {
    it('should call createNewTweet and return the result', async () => {
      const createTweetDto: CreateTweetDto = {
        authorId: 'author123',
        content: 'Test tweet content',
        title: '',
      };
      const expectedResult: TCreateTweetResponse = {
        id: 'tweet123',
        authorId: 'author123',
        content: 'Test tweet content',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: '',
      };
      (service.createNewTweet as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.createNewTweet(createTweetDto);

      expect(service.createNewTweet).toHaveBeenCalledWith(createTweetDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTweets', () => {
    it('should call getTweets and return the result', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult: TGetTweetsResponse = {
        data: [
          {
            id: 'tweet1',
            authorId: 'author1',
            content: 'Tweet 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            title: '',
          },
        ],
        totalCount: 0,
        currentPage: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
      (service.getTweets as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getTweets(paginationDto);

      expect(service.getTweets).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTweet', () => {
    it('should call getTweet and return the result', async () => {
      const getTweetDto: GetTweetDto = { id: 'tweet123' };
      const expectedResult: TGetTweetResponse = {
        id: 'tweet123',
        authorId: 'author123',
        content: 'Test tweet content',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: '',
      };
      (service.getTweet as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getTweet(getTweetDto);

      expect(service.getTweet).toHaveBeenCalledWith(getTweetDto.id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if tweet is not found', async () => {
      const getTweetDto: GetTweetDto = { id: 'nonexistent' };
      (service.getTweet as jest.Mock).mockResolvedValue(null);

      await expect(controller.getTweet(getTweetDto)).rejects.toThrowError(
        new NotFoundException({
          message: 'Tweet not found',
          code: ERROR_LIST.TWEET_NOT_FOUND,
        }),
      );
    });
  });

  describe('softDeleteTweet', () => {
    it('should call softDelete and return success true if deleted', async () => {
      const softDeleteTweetDto: SoftDeleteTweetDto = { id: 'tweet123' };
      const mockTweet = { id: 'tweet123', deletedAt: new Date() };
      (service.softDelete as jest.Mock).mockResolvedValue(mockTweet);

      const result = await controller.softDeleteTweet(softDeleteTweetDto);

      expect(service.softDelete).toHaveBeenCalledWith(softDeleteTweetDto.id);
      expect(result).toEqual({ success: true });
    });

    it('should call softDelete and return success false if not deleted', async () => {
      const softDeleteTweetDto: SoftDeleteTweetDto = { id: 'tweet123' };
      const mockTweet = { id: 'tweet123', deletedAt: null };
      (service.softDelete as jest.Mock).mockResolvedValue(mockTweet);

      const result = await controller.softDeleteTweet(softDeleteTweetDto);

      expect(service.softDelete).toHaveBeenCalledWith(softDeleteTweetDto.id);
      expect(result).toEqual({ success: false });
    });
  });

  describe('softDeleteTweetByAuthor', () => {
    it('should call softDeleteByAuthor', async () => {
      const softDeleteTweetByAuthorDto: SoftDeleteTweetByAuthorDto = {
        authorId: 'author123',
      };
      (service.softDeleteByAuthor as jest.Mock).mockResolvedValue(undefined);

      await controller.softDeleteTweetByAuthor(softDeleteTweetByAuthorDto);

      expect(service.softDeleteByAuthor).toHaveBeenCalledWith(
        softDeleteTweetByAuthorDto.authorId,
      );
    });
  });

  describe('updateTweet', () => {
    it('should call updateTweet and return the result', async () => {
      const updateTweetDto: UpdateTweetDto = {
        id: 'tweet123',
        content: 'Updated content',
      };
      const expectedResult: TUpdateTweetResponse = {
        id: 'tweet123',
        authorId: 'author123',
        content: 'Updated content',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: '',
      };
      (service.updateTweet as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.updateTweet(updateTweetDto);

      expect(service.updateTweet).toHaveBeenCalledWith(updateTweetDto);
      expect(result).toEqual(expectedResult);
    });
  });
});

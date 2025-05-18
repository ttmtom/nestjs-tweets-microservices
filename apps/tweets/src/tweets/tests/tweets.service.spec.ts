import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import { CreateTweetDto, UpdateTweetDto } from '@libs/contracts/tweets/dto';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Tweet } from '../../database/entities';
import { TweetsRepository } from '../tweets.repository';
import { TweetsService } from '../tweets.service';

describe('TweetsService', () => {
  let service: TweetsService;
  let repository: TweetsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: TweetsRepository,
          useValue: {
            insert: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            softDeleteByAuthorId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    repository = module.get<TweetsRepository>(TweetsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewTweet', () => {
    it('should create a new tweet', async () => {
      const createTweetDto: CreateTweetDto = {
        title: 'Test Tweet',
        content: 'This is a test tweet.',
        authorId: 'user123',
      };
      const newTweet = new Tweet(
        createTweetDto.title,
        createTweetDto.content,
        createTweetDto.authorId,
      );
      (repository.insert as jest.Mock).mockResolvedValue(newTweet);

      const result = await service.createNewTweet(createTweetDto);

      expect(repository.insert).toHaveBeenCalledWith(expect.any(Tweet));
      expect(result).toEqual(newTweet);
    });
  });

  describe('getTweets', () => {
    it('should return paginated tweets', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const tweets: Tweet[] = [
        new Tweet('Tweet 1', 'Content 1', 'user1'),
        new Tweet('Tweet 2', 'Content 2', 'user2'),
      ];
      const totalCount = 2;
      (repository.findAll as jest.Mock).mockResolvedValue([tweets, totalCount]);

      const result = await service.getTweets(paginationDto);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        data: tweets,
        totalCount,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  describe('getTweet', () => {
    it('should return a tweet by id', async () => {
      const tweetId = 'tweet123';
      const tweet = new Tweet('Test Tweet', 'Content', 'user123');
      (repository.findById as jest.Mock).mockResolvedValue(tweet);

      const result = await service.getTweet(tweetId);

      expect(repository.findById).toHaveBeenCalledWith(tweetId);
      expect(result).toEqual(tweet);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a tweet', async () => {
      const tweetId = 'tweet123';
      const tweet = new Tweet('Test Tweet', 'Content', 'user123');
      (repository.findById as jest.Mock).mockResolvedValue(tweet);
      (repository.save as jest.Mock).mockResolvedValue({
        ...tweet,
        deletedAt: expect.any(Date),
      });

      const result = await service.softDelete(tweetId);

      expect(repository.findById).toHaveBeenCalledWith(tweetId);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('softDeleteByAuthor', () => {
    it('should soft delete tweets by author id', async () => {
      const authorId = 'user123';
      (repository.softDeleteByAuthorId as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.softDeleteByAuthor(authorId);

      expect(repository.softDeleteByAuthorId).toHaveBeenCalledWith(authorId);
    });
  });

  describe('updateTweet', () => {
    it('should update a tweet', async () => {
      const updateTweetDto: UpdateTweetDto = {
        id: 'tweet123',
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const existingTweet = new Tweet('Old Title', 'Old Content', 'user123');
      (repository.findById as jest.Mock).mockResolvedValue(existingTweet);
      const updatedTweet = {
        ...existingTweet,
        title: updateTweetDto.title,
        content: updateTweetDto.content,
      };
      (repository.save as jest.Mock).mockResolvedValue(updatedTweet);

      const result = await service.updateTweet(updateTweetDto);

      expect(repository.findById).toHaveBeenCalledWith(updateTweetDto.id);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: updateTweetDto.title,
          content: updateTweetDto.content,
        }),
      );
      expect(result).toEqual(updatedTweet);
    });

    it('should throw NotFoundException if tweet does not exist', async () => {
      const updateTweetDto: UpdateTweetDto = {
        id: 'nonexistent',
        title: 'Updated Title',
        content: 'Updated Content',
      };
      (repository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTweet(updateTweetDto)).rejects.toThrowError(
        new NotFoundException({
          message: 'Tweet not found',
          code: ERROR_LIST.TWEET_NOT_FOUND,
        }),
      );
    });
  });
});

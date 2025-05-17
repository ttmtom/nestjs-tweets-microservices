import { PaginationDto } from '@libs/contracts/general/dto';
import { CreateTweetDto } from '@libs/contracts/tweets/dto/create-tweet.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Tweet } from '../database/entities';
import { TweetsRepository } from './tweets.repository';

@Injectable()
export class TweetsService {
  constructor(
    @Inject()
    private readonly repository: TweetsRepository,
  ) {}

  createNewTweet(createTweetDto: CreateTweetDto) {
    const tweet = new Tweet(
      createTweetDto.title,
      createTweetDto.content,
      createTweetDto.authorId,
    );
    return this.repository.insert(tweet);
  }

  async getTweets(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [users, totalCount] = await this.repository.findAll(page, limit);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

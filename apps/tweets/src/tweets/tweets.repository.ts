import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Tweet } from '../database/entities';

@Injectable()
export class TweetsRepository {
  constructor(
    @InjectRepository(Tweet)
    private readonly repository: Repository<Tweet>,
  ) {}

  async insert(tweet: Tweet) {
    return this.repository.save(tweet);
  }

  async findAll(page: number, limit: number): Promise<[Tweet[], number]> {
    const skip = (page - 1) * limit;

    const [tweets, totalCount] = await this.repository.findAndCount({
      skip: skip,
      take: limit,
      order: { createdAt: 'DESC' },
      where: { deletedAt: IsNull() },
    });

    return [tweets, totalCount];
  }
}

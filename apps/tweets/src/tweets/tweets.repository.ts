import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}

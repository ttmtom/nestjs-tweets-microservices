import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async isUserExists(username: string): Promise<boolean> {
    return this.repository.exists({ where: { username } });
  }

  async insert(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async remove(user: User) {
    return this.repository.remove(user);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../database/entities';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async isUserExists(username: string): Promise<boolean> {
    return this.repository.exists({ where: { username, deletedAt: IsNull() } });
  }

  async insert(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async remove(user: User) {
    return this.repository.remove(user);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username, deletedAt: IsNull() },
    });
  }

  async getUserByIdHash(idHash: string): Promise<User | null> {
    return this.repository.findOne({
      where: { idHash, deletedAt: IsNull() },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findAll(page: number, limit: number): Promise<[User[], number]> {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await this.repository.findAndCount({
      skip: skip,
      take: limit,
      order: { createdAt: 'DESC' },
      where: { deletedAt: IsNull() },
    });

    return [users, totalCount];
  }
}

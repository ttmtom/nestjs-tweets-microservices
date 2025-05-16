import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredential } from '../database/entities';

@Injectable()
export class UserCredentialRepository {
  constructor(
    @InjectRepository(UserCredential)
    private readonly repository: Repository<UserCredential>,
  ) {}

  async insertNewUserCredential(
    userCredential: UserCredential,
  ): Promise<UserCredential> {
    return this.repository.save(userCredential);
  }
}

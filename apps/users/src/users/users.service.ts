import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto/pagination.dto';
import { RegisterUserDto, UpdateUserDto } from '@libs/contracts/users/dto';
import { RevertRegisterUserDto } from '@libs/contracts/users/dto/revert-register-user.dto';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../database/entities';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name, {
    timestamp: true,
  });
  constructor(
    @Inject()
    private readonly repository: UsersRepository,
  ) {}

  async createNewUser(registerUserDto: RegisterUserDto): Promise<User> {
    this.logger.log(`createNewUser: ${registerUserDto.username}`);
    const existed = await this.repository.isUserExists(
      registerUserDto.username,
    );
    if (existed) {
      this.logger.error(`Username already exists: ${registerUserDto.username}`);
      throw new HttpException(
        {
          message: 'Username already exists',
          code: ERROR_LIST.USER_USERNAME_EXISTED,
        },
        HttpStatus.CONFLICT,
      );
    }

    const newUser = new User(
      registerUserDto.username,
      registerUserDto.firstName,
      registerUserDto.lastName,
      registerUserDto.dateOfBirth,
    );
    const user = await this.repository.insert(newUser);
    this.logger.log(`User created: ${user.username}`);
    return user;
  }

  async revertNewUser(
    revertRegisterUserDto: RevertRegisterUserDto,
  ): Promise<boolean> {
    this.logger.log(`revertNewUser: ${revertRegisterUserDto.username}`);
    const { username } = revertRegisterUserDto;
    const existed = await this.repository.isUserExists(username);
    if (!existed) {
      this.logger.debug(`revertNewUser Username does not exist: ${username}`);
      return false;
    }
    const user = await this.repository.getUserByUsername(username);

    if (!user) {
      this.logger.debug(`revertNewUser User not found: ${username}`);

      return false;
    }

    await this.repository.remove(user);
    return true;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.repository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException({
        message: `User not found`,
        code: ERROR_LIST.USER_USERNAME_NOT_FOUND,
      });
    }
    return user;
  }

  async getUserByIdHash(idHash: string): Promise<User> {
    const user = await this.repository.getUserByIdHash(idHash);
    if (!user) {
      throw new NotFoundException({
        message: `User not found`,
        code: ERROR_LIST.USER_USERNAME_NOT_FOUND,
      });
    }
    return user;
  }

  async softDelete(idHash: string): Promise<User> {
    const user = await this.getUserByIdHash(idHash);
    user.deletedAt = new Date();
    return this.repository.save(user);
  }

  async getUsers(paginationDto: PaginationDto) {
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

  async updateUser(updateUserDto: UpdateUserDto) {
    const user = await this.getUserByIdHash(updateUserDto.idHash);

    user.firstName = updateUserDto.firstName ?? user.firstName;
    user.lastName = updateUserDto.lastName ?? user.lastName;
    user.dateOfBirth = updateUserDto.dateOfBirth ?? user.dateOfBirth;
    return this.repository.save(user);
  }
}

import { RegisterUserDto } from '@libs/contracts/users/dto';
import { RevertRegisterUserDto } from '@libs/contracts/users/dto/revert-register-user.dto';
import { ERROR_LIST } from '@libs/contracts/utils/error-list';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
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
}

import { EventResponseWrapperInterceptor } from '@libs/contracts/general/event-response-wrapper-interceptor';
import { GetByUsernameDto } from '@libs/contracts/users/dto/get-by-username.dto';
import { RegisterUserDto } from '@libs/contracts/users/dto/register-user.dto';
import { RevertRegisterUserDto } from '@libs/contracts/users/dto/revert-register-user.dto';
import { TGetByUsernameResponse } from '@libs/contracts/users/response';
import { TRegisterUserResponse } from '@libs/contracts/users/response/register-user.response';
import { TRevertRegisterUserResponse } from '@libs/contracts/users/response/revert-register-user.response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name, {
    timestamp: true,
  });

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERN.CREATE_NEW_USER)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async createNewUser(
    @Payload() registerUserDto: RegisterUserDto,
  ): Promise<TRegisterUserResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.CREATE_NEW_USER}: ${JSON.stringify(registerUserDto)}`,
    );

    const newUser = await this.usersService.createNewUser(registerUserDto);
    return {
      id: newUser.id,
      idHash: newUser.idHash,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      dateOfBirth: newUser.dateOfBirth,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  @MessagePattern(USERS_PATTERN.REVERT_CREATE_NEW_USER)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async revertNewUser(
    @Payload() revertRegisterUserDto: RevertRegisterUserDto,
  ): Promise<TRevertRegisterUserResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.REVERT_CREATE_NEW_USER}: ${revertRegisterUserDto.username}`,
    );

    const result = await this.usersService.revertNewUser(revertRegisterUserDto);
    this.logger.log(
      `event: ${USERS_PATTERN.REVERT_CREATE_NEW_USER} ${revertRegisterUserDto.username} success: ${result}`,
    );

    return {
      success: result,
      username: revertRegisterUserDto.username,
    };
  }

  @MessagePattern(USERS_PATTERN.GET_USER_BY_USERNAME)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getUserByUsername(
    @Payload() getByUsernameDto: GetByUsernameDto,
  ): Promise<TGetByUsernameResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.GET_USER_BY_USERNAME}: ${getByUsernameDto.username}`,
    );
    const user = await this.usersService.getUserByUsername(
      getByUsernameDto.username,
    );
    return {
      id: user.id,
      idHash: user.idHash,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

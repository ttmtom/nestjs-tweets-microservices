import { PaginationDto } from '@libs/contracts/general/dto';
import { EventResponseWrapperInterceptor } from '@libs/contracts/general/event-response-wrapper-interceptor';
import {
  GetByIdHashDto,
  GetByUsernameDto,
  GetUserByIdDto,
  RegisterUserDto,
  RevertRegisterUserDto,
  SoftDeleteUserDto,
  UpdateUserDto,
} from '@libs/contracts/users/dto';
import {
  TGetByIdHashResponse,
  TGetByUsernameResponse,
  TGetUserByIdResponse,
  TGetUsersResponse,
  TRegisterUserResponse,
  TRevertRegisterUserResponse,
  TSoftDeleteUserResponseDTO,
  TUpdateUserResponse,
} from '@libs/contracts/users/response';
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

  @MessagePattern(USERS_PATTERN.GET_USER_BY_HASH_ID)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getUserByHashId(
    @Payload() getByIdHashDto: GetByIdHashDto,
  ): Promise<TGetByIdHashResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.GET_USER_BY_USERNAME}: ${getByIdHashDto.idHash}`,
    );
    const user = await this.usersService.getUserByIdHash(getByIdHashDto.idHash);
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

  @MessagePattern(USERS_PATTERN.SOFT_DELETE_USER)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async softDeleteUser(
    @Payload() softDeleteDto: SoftDeleteUserDto,
  ): Promise<TSoftDeleteUserResponseDTO> {
    this.logger.log(
      `event: ${USERS_PATTERN.SOFT_DELETE_USER}: ${softDeleteDto.idHash}`,
    );
    const result = await this.usersService.softDelete(softDeleteDto.idHash);
    return {
      success: !!result.deletedAt,
      user: result,
    };
  }

  @MessagePattern(USERS_PATTERN.GET_USERS)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getUsers(
    @Payload() paginationDto: PaginationDto,
  ): Promise<TGetUsersResponse> {
    this.logger.log(`event: ${USERS_PATTERN.GET_USERS}`);
    const paginationData = await this.usersService.getUsers(paginationDto);

    return paginationData;
  }

  @MessagePattern(USERS_PATTERN.UPDATE_USER)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async updateUser(
    @Payload() updateUserDto: UpdateUserDto,
  ): Promise<TUpdateUserResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.UPDATE_USER}: ${updateUserDto.idHash}`,
    );
    const updateUser = await this.usersService.updateUser(updateUserDto);
    return updateUser;
  }

  @MessagePattern(USERS_PATTERN.GET_USERNAME_BY_ID)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getUserById(
    @Payload() getUserByIdDto: GetUserByIdDto,
  ): Promise<TGetUserByIdResponse> {
    this.logger.log(
      `event: ${USERS_PATTERN.GET_USERNAME_BY_ID}: ${getUserByIdDto.id}`,
    );
    const user = await this.usersService.getUserById(getUserByIdDto.id);
    return user;
  }
}

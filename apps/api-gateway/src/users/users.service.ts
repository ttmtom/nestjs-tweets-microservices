import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { GetUserRoleDto } from '@libs/contracts/auth/dto';
import {
  TGetUserRoleResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto, SuccessResponse } from '@libs/contracts/general/dto';
import {
  GetByIdHashDto,
  GetByUsernameDto,
  GetUsersDto,
  RegisterUserDto,
  SoftDeleteUserDto,
  UpdateUserDto,
} from '@libs/contracts/users/dto';
import {
  TGetByIdHashResponse,
  TGetByUsernameResponse,
  TGetUsersResponse,
  TRegisterUserResponse,
  TSoftDeleteUserResponseDTO,
  TUpdateUserResponse,
} from '@libs/contracts/users/response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';
import { sendEvent } from '../common/helper/send-event';
import { CreateUserDto, UpdateUserGatewayDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject()
    private readonly authService: AuthService,
    @Inject(SERVICE_LIST.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async userRegistration(userDto: RegisterUserDto) {
    this.logger.log('Registering user:', userDto.username);
    const res = await sendEvent<TRegisterUserResponse, RegisterUserDto>(
      this.usersClient,
      USERS_PATTERN.CREATE_NEW_USER,
      userDto,
      this.logger,
    );

    return res;
  }

  // emit event to revert user registration
  // no need to handle the response
  userRegistrationRevert(userDto: RegisterUserDto) {
    this.logger.log('Revert Registering user: ', userDto.username);
    // try {
    //   const response = await firstValueFrom(
    //     this.usersClient.emit<
    //       SuccessResponse<RegisterUserResponse>,
    //       RegisterUserDto
    //     >(USERS_PATTERN.REVERT_CREATE_NEW_USER, userDto),
    //   );
    //   return response;
    // } catch (error) {
    //   this.logger.error(
    //     'Error from USERS_SERVICE:',
    //     JSON.stringify(error, null, 2),
    //   );
    //
    //   const errPayload = error as ErrorResponse;
    //   throw new HttpException(
    //     {
    //       message:
    //         errPayload.message || 'An error occurred with the user service.',
    //       errors: errPayload.errors,
    //       code: errPayload.code,
    //     },
    //     errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
    this.usersClient.emit<
      SuccessResponse<TRegisterUserResponse>,
      RegisterUserDto
    >(USERS_PATTERN.REVERT_CREATE_NEW_USER, userDto);
  }

  async getUserByUsername(getByUsernameDto: GetByUsernameDto) {
    const res = await sendEvent<TGetByUsernameResponse, GetByUsernameDto>(
      this.usersClient,
      USERS_PATTERN.GET_USER_BY_USERNAME,
      getByUsernameDto,
      this.logger,
    );
    return res;
  }

  async getUserByIdHash(idHash: string) {
    const userRes = await sendEvent<TGetByIdHashResponse, GetByIdHashDto>(
      this.usersClient,
      USERS_PATTERN.GET_USER_BY_HASH_ID,
      { idHash },
      this.logger,
    );

    const { data: userData } = userRes;

    const roleRes = await this.authService.getUserRole(userData.id);
    const { data } = roleRes;

    return { ...userData, role: data.role };
  }

  async softDeleteUser(idHash: string) {
    const res = await sendEvent<TSoftDeleteUserResponseDTO, SoftDeleteUserDto>(
      this.usersClient,
      USERS_PATTERN.SOFT_DELETE_USER,
      { idHash },
      this.logger,
    );
    return res;
  }

  async createUser(createUserDto: CreateUserDto) {
    const userRegisterDto = new RegisterUserDto(
      createUserDto.username,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.dateOfBirth,
    );
    let userCreateRes: SuccessResponse<TRegisterUserResponse>;
    try {
      userCreateRes = await this.userRegistration(userRegisterDto);
    } catch (error) {
      this.logger.error('Failed to create user, reverting registration');
      this.userRegistrationRevert(userRegisterDto);
      throw error;
    }
    const { data: userData } = userCreateRes;

    let authCred: SuccessResponse<TRegisterAuthResponse>;
    try {
      authCred = await this.authService.insertUserAuthCred({
        userId: userData.id,
        password: createUserDto.password,
        role: createUserDto.role,
      });
    } catch (error) {
      this.logger.error(
        'Failed to create user auth credentials, revert user creation',
      );
      this.userRegistrationRevert(userRegisterDto);
      throw error;
    }
    const { data: authData } = authCred;
    return {
      user: userData,
      auth: authData,
    };
  }

  async getUsers(paginationDto: PaginationDto) {
    const usersRes = await sendEvent<TGetUsersResponse, GetUsersDto>(
      this.usersClient,
      USERS_PATTERN.GET_USERS,
      paginationDto,
      this.logger,
    );
    const { data: users } = usersRes;

    const userAuths = {};
    for (const user of users.data) {
      const res = await sendEvent<TGetUserRoleResponse, GetUserRoleDto>(
        this.authClient,
        AUTH_PATTERN.AUTH_GET_USER_ROLE,
        { userId: user.id },
        this.logger,
      );
      userAuths[user.id] = res.data.role;
    }

    return {
      users,
      userAuths,
    };
  }

  async updateUser(updateUserDto: UpdateUserGatewayDto, idHash: string) {
    const res = await sendEvent<TUpdateUserResponse, UpdateUserDto>(
      this.usersClient,
      USERS_PATTERN.UPDATE_USER,
      {
        ...updateUserDto,
        idHash,
      },
      this.logger,
    );
    return res.data;
  }
}

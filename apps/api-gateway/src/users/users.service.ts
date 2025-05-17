import { TRegisterAuthResponse } from '@libs/contracts/auth/response';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ErrorResponse } from '@libs/contracts/general/dto/error-response.dto';
import { PaginationDto } from '@libs/contracts/general/dto/pagination.dto';
import { SuccessResponse } from '@libs/contracts/general/dto/success-response.dto';
import { GetByUsernameDto, RegisterUserDto } from '@libs/contracts/users/dto';
import { GetByIdHashDto } from '@libs/contracts/users/dto/get-by-id-hash.dto';
import { GetUsersDto } from '@libs/contracts/users/dto/get-users.dto';
import { TGetByUsernameResponse } from '@libs/contracts/users/response';
import { TGetByIdHashResponse } from '@libs/contracts/users/response/get-by-id-hash.response';
import { TGetUsersResponse } from '@libs/contracts/users/response/get-users.response';
import { TRegisterUserResponse } from '@libs/contracts/users/response/register-user.response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject()
    private readonly authService: AuthService,
    @Inject(SERVICE_LIST.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
  ) {}

  async userRegistration(userDto: RegisterUserDto) {
    this.logger.log('Registering user:', userDto.username);
    try {
      const response = await firstValueFrom(
        this.usersClient.send<
          SuccessResponse<TRegisterUserResponse>,
          RegisterUserDto
        >(USERS_PATTERN.CREATE_NEW_USER, userDto),
      );
      return response;
    } catch (error) {
      this.logger.error(
        '/userRegistration Error from USERS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
      const response = await firstValueFrom(
        this.usersClient.send<
          SuccessResponse<TGetByUsernameResponse>,
          GetByUsernameDto
        >(USERS_PATTERN.GET_USER_BY_USERNAME, getByUsernameDto),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error from USERS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByIdHash(idHash: string) {
    let userRes: SuccessResponse<TGetByIdHashResponse>;
    try {
      userRes = await firstValueFrom(
        this.usersClient.send<
          SuccessResponse<TGetByIdHashResponse>,
          GetByIdHashDto
        >(USERS_PATTERN.GET_USER_BY_HASH_ID, { idHash }),
      );
    } catch (error) {
      this.logger.error(
        'Error from USERS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const { data: userData } = userRes;

    const roleRes = await this.authService.getUserRole(userData.id);
    const { data } = roleRes;

    return { ...userData, role: data.role };
  }

  async softDeleteUser(idHash: string) {
    try {
      const response = await firstValueFrom(
        this.usersClient.send<
          SuccessResponse<TGetByIdHashResponse>,
          GetByIdHashDto
        >(USERS_PATTERN.SOFT_DELETE_USER, { idHash }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error from USERS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    let usersRes: SuccessResponse<TGetUsersResponse>;

    try {
      usersRes = await firstValueFrom(
        this.usersClient.send<SuccessResponse<TGetUsersResponse>, GetUsersDto>(
          USERS_PATTERN.GET_USERS,
          paginationDto,
        ),
      );
    } catch (error) {
      this.logger.error(
        'Error from USERS_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          errors: errPayload.errors,
          code: errPayload.code,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return usersRes.data;
  }
}

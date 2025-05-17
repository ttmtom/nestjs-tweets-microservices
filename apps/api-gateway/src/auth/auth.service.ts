import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import {
  GetUserRoleDto,
  LoginAuthDto,
  RegisterAuthDto,
} from '@libs/contracts/auth/dto';
import {
  TGetUserRoleResponse,
  TLoginAuthResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ErrorResponse, SuccessResponse } from '@libs/contracts/general/dto';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async insertUserAuthCred(registerAuthDto: RegisterAuthDto) {
    this.logger.log(`insertUserAuthCred ${registerAuthDto.userId}`);
    try {
      const response = await firstValueFrom(
        this.authClient.send<
          SuccessResponse<TRegisterAuthResponse>,
          RegisterAuthDto
        >(AUTH_PATTERN.AUTH_REGISTER, registerAuthDto),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error from AUTH_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          code: errPayload.code,
          errors: errPayload.errors,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async userLogin(loginAuthDto: LoginAuthDto) {
    this.logger.log(`userLogin${loginAuthDto.userId}`);
    try {
      const response = await firstValueFrom(
        this.authClient.send<SuccessResponse<TLoginAuthResponse>, LoginAuthDto>(
          AUTH_PATTERN.AUTH_LOGIN,
          loginAuthDto,
        ),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error from AUTH_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          code: errPayload.code,
          errors: errPayload.errors,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRole(userId: string) {
    try {
      const response = await firstValueFrom(
        this.authClient.send<
          SuccessResponse<TGetUserRoleResponse>,
          GetUserRoleDto
        >(AUTH_PATTERN.AUTH_GET_USER_ROLE, { userId }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error from AUTH_SERVICE:',
        JSON.stringify(error, null, 2),
      );

      const errPayload = error as ErrorResponse;
      throw new HttpException(
        {
          message:
            errPayload.message || 'An error occurred with the user service.',
          code: errPayload.code,
          errors: errPayload.errors,
        },
        errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

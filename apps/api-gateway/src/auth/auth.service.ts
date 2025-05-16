import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { LoginAuthDto } from '@libs/contracts/auth/dto/login-auth.dto';
import { RegisterAuthDto } from '@libs/contracts/auth/dto/register-auth.dto';
import {
  TLoginAuthResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ErrorResponse } from '@libs/contracts/general/dto/error-response.dto';
import { SuccessResponse } from '@libs/contracts/general/dto/success-response.dto';
import { GetByUsernameDto } from '@libs/contracts/users/dto';
import { RegisterUserDto } from '@libs/contracts/users/dto/register-user.dto';
import { TGetByUsernameResponse } from '@libs/contracts/users/response';
import { TRegisterUserResponse } from '@libs/contracts/users/response/register-user.response';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject()
    private readonly usersService: UsersService,
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  private async insertUserAuthCred(registerAuthDto: RegisterAuthDto) {
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

  private async userLogin(loginAuthDto: LoginAuthDto) {
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

  async register(registerDto: RegisterDto) {
    const userRegisterDto = new RegisterUserDto(
      registerDto.username,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.dateOfBirth,
    );
    let userCreateRes: SuccessResponse<TRegisterUserResponse>;
    try {
      userCreateRes = await this.usersService.userRegistration(userRegisterDto);
    } catch (error) {
      this.logger.error('Failed to create user, reverting registration');
      throw error;
    }
    const { data: userData } = userCreateRes;

    let authCred: SuccessResponse<TRegisterAuthResponse>;
    try {
      authCred = await this.insertUserAuthCred({
        userId: userData.id,
        password: registerDto.password,
      });
    } catch (error) {
      this.logger.error(
        'Failed to create user auth credentials, revert user creation',
      );
      this.usersService.userRegistrationRevert(registerDto);
      throw error;
    }
    const { data: authData } = authCred;
    return {
      user: userData,
      auth: authData,
    };
  }

  async login(loginDto: LoginDto) {
    const getUserByUsernameBto = new GetByUsernameDto(loginDto.username);
    let getUserRes: SuccessResponse<TGetByUsernameResponse>;
    try {
      getUserRes =
        await this.usersService.getUserByUsername(getUserByUsernameBto);
    } catch (error) {
      this.logger.error(
        `Failed to get user by username:}`,
        JSON.stringify(error),
      );
      throw new UnauthorizedException({
        message: 'Invalid username or password',
        code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
      });
    }
    const { data: userData } = getUserRes;

    let loginAuthRes: SuccessResponse<TLoginAuthResponse>;

    try {
      loginAuthRes = await this.userLogin({
        userId: userData.id,
        username: userData.username,
        password: loginDto.password,
      });
    } catch (error) {
      this.logger.error(`Failed to valid user:`, JSON.stringify(error));
      throw new UnauthorizedException({
        message: 'Invalid username or password',
        code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
      });
    }

    const { data: authData } = loginAuthRes;
    return {
      userData,
      authData: authData,
    };
  }
}

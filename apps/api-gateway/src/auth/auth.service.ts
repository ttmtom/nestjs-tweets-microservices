import * as authServiceConfig from '@libs/contracts/auth/auth.config';
import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { RegisterAuthDto } from '@libs/contracts/auth/dto/register-auth.dto';
import { RegisterAuthResponse } from '@libs/contracts/auth/response';
import { ErrorResponse } from '@libs/contracts/general/dto/error-response.dto';
import { SuccessResponse } from '@libs/contracts/general/dto/success-response.dto';
import { RegisterUserDto } from '@libs/contracts/users/dto/register-user.dto';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject()
    private readonly usersService: UsersService,
    @Inject(authServiceConfig.SERVICE_NAME)
    private readonly authClient: ClientProxy,
  ) {}

  private async insertUserAuthCred(registerAuthDto: RegisterAuthDto) {
    this.logger.log(`insertUserAuthCred ${registerAuthDto.userId}`);
    try {
      const response = await firstValueFrom(
        this.authClient.send<
          SuccessResponse<RegisterAuthResponse>,
          RegisterAuthDto
        >(AUTH_PATTERN.AUTH_REGISTER, registerAuthDto),
      );
      return response;
    } catch (error) {
      console.error(
        'Error from USERS_SERVICE:',
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
    const userCreateRes =
      await this.usersService.userRegistration(userRegisterDto);
    const { data: userData } = userCreateRes;

    let authCred: SuccessResponse<RegisterAuthResponse>;
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
}

import { EUserRole } from '@libs/contracts/auth/enums';
import {
  TLoginAuthResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SuccessResponse } from '@libs/contracts/general/dto';
import { GetByUsernameDto, RegisterUserDto } from '@libs/contracts/users/dto';
import {
  TGetByUsernameResponse,
  TRegisterUserResponse,
} from '@libs/contracts/users/response';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginDto, RegisterDto } from '../auth/dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async register(registerDto: RegisterDto, role = EUserRole.USER) {
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
      authCred = await this.authService.insertUserAuthCred({
        userId: userData.id,
        password: registerDto.password,
        role,
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
      loginAuthRes = await this.authService.userLogin({
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

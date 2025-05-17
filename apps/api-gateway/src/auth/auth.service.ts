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
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendEvent } from '../common/helper/send-event';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async insertUserAuthCred(registerAuthDto: RegisterAuthDto) {
    this.logger.log(`insertUserAuthCred ${registerAuthDto.userId}`);
    const res = await sendEvent<TRegisterAuthResponse, RegisterAuthDto>(
      this.authClient,
      AUTH_PATTERN.AUTH_REGISTER,
      registerAuthDto,
      this.logger,
    );
    return res;
  }

  async userLogin(loginAuthDto: LoginAuthDto) {
    this.logger.log(`userLogin${loginAuthDto.userId}`);
    const res = await sendEvent<TLoginAuthResponse, LoginAuthDto>(
      this.authClient,
      AUTH_PATTERN.AUTH_LOGIN,
      loginAuthDto,
      this.logger,
    );
    return res;
  }

  async getUserRole(userId: string) {
    const res = await sendEvent<TGetUserRoleResponse, GetUserRoleDto>(
      this.authClient,
      AUTH_PATTERN.AUTH_GET_USER_ROLE,
      { userId },
      this.logger,
    );
    return res;
  }
}

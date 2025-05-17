import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import {
  GetUserRoleDto,
  LoginAuthDto,
  RegisterAuthDto,
  ValidateTokenDto,
} from '@libs/contracts/auth/dto';
import {
  TGetUserRoleResponse,
  TLoginAuthResponse,
  TRegisterAuthResponse,
  TValidateTokenResponse,
} from '@libs/contracts/auth/response';
import { EventResponseWrapperInterceptor } from '@libs/contracts/general/event-response-wrapper-interceptor';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERN.AUTH_REGISTER)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async register(
    @Payload() registerAuthDto: RegisterAuthDto,
  ): Promise<TRegisterAuthResponse> {
    const newCred = await this.authService.userAuthRegister(registerAuthDto);
    return { role: newCred.role, userId: newCred.userId };
  }

  @MessagePattern(AUTH_PATTERN.AUTH_LOGIN)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async login(
    @Payload() loginAuthDto: LoginAuthDto,
  ): Promise<TLoginAuthResponse> {
    const token = await this.authService.userLogin(loginAuthDto);
    return token;
  }

  @MessagePattern(AUTH_PATTERN.AUTH_VALIDATE_TOKEN)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async validateToken(
    @Payload() validateTokenDto: ValidateTokenDto,
  ): Promise<TValidateTokenResponse> {
    const jwtPayload = await this.authService.validateToken(validateTokenDto);
    return {
      isValid: !!jwtPayload,
      user: jwtPayload,
    };
  }

  @MessagePattern(AUTH_PATTERN.AUTH_GET_USER_ROLE)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async getUserRole(
    @Payload() getUserRoleDto: GetUserRoleDto,
  ): Promise<TGetUserRoleResponse> {
    const role = await this.authService.getUserRole(getUserRoleDto.userId);
    return { role };
  }
}

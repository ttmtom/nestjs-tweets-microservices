import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { LoginAuthDto } from '@libs/contracts/auth/dto/login-auth.dto';
import { RegisterAuthDto } from '@libs/contracts/auth/dto/register-auth.dto';
import {
  LoginAuthResponse,
  RegisterAuthResponse,
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
  ): Promise<RegisterAuthResponse> {
    const newCred = await this.authService.userAuthRegister(registerAuthDto);
    return { role: newCred.role, userId: newCred.userId };
  }

  @MessagePattern(AUTH_PATTERN.AUTH_LOGIN)
  @UseInterceptors(EventResponseWrapperInterceptor)
  async login(
    @Payload() loginAuthDto: LoginAuthDto,
  ): Promise<LoginAuthResponse> {
    const token = await this.authService.userLogin(loginAuthDto);
    return token;
  }
}

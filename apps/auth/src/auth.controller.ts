import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AUTH_PATTERN } from '../../../libs/contracts/auth/auth.pattern';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERN.USER_REGISTER)
  async registerUser(): Promise<any> {
    // @TODO: Implement user registration logic here
    throw new Error('Method not implemented.');
  }
}

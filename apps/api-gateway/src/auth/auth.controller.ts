import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { LoginResponse, RegisterResponse } from './response';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @Public()
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    this.logger.log('/register called with username: ', registerDto.username);
    const result = await this.authService.register(registerDto);
    const response = new RegisterResponse(result.user, result.auth);
    this.logger.log('Register successful: ', response.username, response.id);
    return response;
  }

  @Post('/login')
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`/login called with username: ${loginDto.username}`);
    const { userData, authData } = await this.authService.login(loginDto);

    return {
      user: {
        id: userData.idHash,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: userData.dateOfBirth,
        role: authData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      token: authData.token,
    };
  }
}

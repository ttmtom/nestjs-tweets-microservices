import { Body, Controller, Logger, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../auth/dto';
import { LoginResponse, RegisterResponse } from '../auth/response';
import { Public } from '../common/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Post('/register')
  @Public()
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    this.logger.log('/register called with username: ', registerDto.username);
    const result = await this.appService.register(registerDto);
    const response = new RegisterResponse(result.user, result.auth);
    this.logger.log('Register successful: ', response.username, response.id);
    return response;
  }

  @Post('/login')
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`/login called with username: ${loginDto.username}`);
    const { userData, authData } = await this.appService.login(loginDto);

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

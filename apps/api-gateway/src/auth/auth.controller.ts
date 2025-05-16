import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponse } from './response/register.response';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    this.logger.log('/register called with username: ', registerDto.username);
    const result = await this.authService.register(registerDto);
    const response = new RegisterResponse(result.user, result.auth);
    this.logger.log('Register successful: ', response.username, response.id);
    return response;
  }

  @Post('/login')
  async login(): Promise<any> {
    return 'Login endpoint';
  }
}

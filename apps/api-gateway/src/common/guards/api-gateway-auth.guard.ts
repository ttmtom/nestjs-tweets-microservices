import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { ValidateTokenDto } from '@libs/contracts/auth/dto';
import { TValidateTokenResponse } from '@libs/contracts/auth/response';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ErrorResponse, SuccessResponse } from '@libs/contracts/general/dto';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiGatewayAuthGuard.name);

  constructor(
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found.');
    }

    try {
      const validateRes = await firstValueFrom(
        this.authClient.send<
          SuccessResponse<TValidateTokenResponse>,
          ValidateTokenDto
        >(AUTH_PATTERN.AUTH_VALIDATE_TOKEN, { token }),
      );

      const { data: userPayload } = validateRes;
      if (!userPayload || !userPayload.user) {
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
        });
      }

      request.user = userPayload.user;
      return true;
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

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { ValidateTokenDto } from '@libs/contracts/auth/dto';
import { TValidateTokenResponse } from '@libs/contracts/auth/response';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { GetByIdHashDto } from '@libs/contracts/users/dto';
import { TGetByIdHashResponse } from '@libs/contracts/users/response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendEvent } from '../helper/send-event';

@Injectable()
export class ApiGatewayAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiGatewayAuthGuard.name);

  constructor(
    @Inject(SERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
    @Inject(SERVICE_LIST.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found.');
    }

    const validateRes = await sendEvent<
      TValidateTokenResponse,
      ValidateTokenDto
    >(
      this.authClient,
      AUTH_PATTERN.AUTH_VALIDATE_TOKEN,
      { token },
      this.logger,
    );

    const { data: userPayload } = validateRes;
    if (!userPayload || !userPayload.user || !userPayload.isValid) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
      });
    }

    await sendEvent<TGetByIdHashResponse, GetByIdHashDto>(
      this.usersClient,
      USERS_PATTERN.GET_USER_BY_HASH_ID,
      {
        idHash: userPayload.user.idHash,
      },
      this.logger,
    );

    request.user = userPayload.user;
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

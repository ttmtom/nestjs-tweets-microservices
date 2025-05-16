import { SuccessResponse } from '@libs/contracts/general/dto/success-response.dto';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const BYPASS_RESPONSE_WRAPPER = 'bypassResponseWrapper';
export const BypassResponseWrapper = () =>
  SetMetadata(BYPASS_RESPONSE_WRAPPER, true);

@Injectable()
export class EventResponseWrapperInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const bypass =
      this.reflector.get<boolean>(
        BYPASS_RESPONSE_WRAPPER,
        context.getHandler(),
      ) ||
      this.reflector.get<boolean>(BYPASS_RESPONSE_WRAPPER, context.getClass());

    if (bypass) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        let message = 'Operation successful';
        let actualData = data;

        if (
          data &&
          typeof data === 'object' &&
          data.hasOwnProperty('message') &&
          data.hasOwnProperty('result')
        ) {
          message = data.message;
          actualData = data.result;
        } else if (
          data &&
          typeof data === 'object' &&
          data.hasOwnProperty('message') &&
          !data.hasOwnProperty('result')
        ) {
          message = data.message;
          actualData = data.data !== undefined ? data.data : null;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: message,
          data: actualData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

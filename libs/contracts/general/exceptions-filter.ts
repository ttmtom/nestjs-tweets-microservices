// src/common/filters/http-exception.filter.ts
import { ErrorResponse } from '@libs/contracts/general/dto/error-response.dto';
import { ERROR_LIST } from '@libs/contracts/utils/error-list';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class MicroserviceAllExceptionsFilter
  implements RpcExceptionFilter<any>
{
  private readonly logger = new Logger(MicroserviceAllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal microservice error';
    let errors: any | undefined = undefined;
    let code: number = ERROR_LIST.INTERNAL_UNEXPECTED_ERROR;

    this.logger.error(
      `Microservice Exception Caught: ${exception?.message || JSON.stringify(exception)}`,
      exception?.stack,
      `Context: ${host.getType()}`, // Will be 'rpc'
    );

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        const res = errorResponse as any;
        message = res.message || exception.message;
        // Handle NestJS validation pipe errors which put details in 'message' array
        if (Array.isArray(res.message) && res.error === 'Bad Request') {
          errors = res.message;
          message = 'Validation failed'; // Or a more generic message
        } else {
          errors = res.errors;
        }
        code = res.code || res.error;
      }
    } else if (exception instanceof RpcException) {
      // If it's already an RpcException, it might be formatted.
      // You can choose to trust its format or re-format it.
      const rpcError = exception.getError();
      if (typeof rpcError === 'string') {
        message = rpcError;
      } else if (typeof rpcError === 'object' && rpcError !== null) {
        const errObj = rpcError as Partial<ErrorResponse>;
        status = errObj.statusCode || status;
        message = errObj.message || message;
        errors = errObj.errors || errors;
        code = errObj.code || code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Avoid sending full stack traces over the wire unless for specific debug scenarios
    } else if (typeof exception === 'object' && exception !== null) {
      // Attempt to extract details if it's a plain error object
      message = (exception as any).message || message;
      status =
        (exception as any).status || (exception as any).statusCode || status;
      errors = (exception as any).errors || errors;
      code = (exception as any).code || code;
    }
    // else: handle other unknown exception types

    const errorPayload: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      errors,
      code,
      timestamp: new Date().toISOString(),
    };

    // This is crucial: return an Observable that emits an error.
    // The 'errorPayload' will be the object received by the calling service's 'catchError' or try/catch.
    return throwError(() => errorPayload);
  }
}

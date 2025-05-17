import { ErrorResponse, SuccessResponse } from '@libs/contracts/general/dto';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export const sendEvent = async <T, U>(
  client: ClientProxy,
  pattern: string,
  data: U,
  logger?: Logger,
) => {
  let res: SuccessResponse<T>;
  try {
    res = await firstValueFrom(
      client.send<SuccessResponse<T>, U>(pattern, data),
    );
  } catch (error) {
    if (logger) {
      logger.error(`Error from ${pattern}:`, JSON.stringify(error, null, 2));
    }

    const errPayload = error as ErrorResponse;
    throw new HttpException(
      {
        message:
          errPayload.message || 'An error occurred with the user service.',
        errors: errPayload.errors,
        code: errPayload.code,
      },
      errPayload.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  return res;
};

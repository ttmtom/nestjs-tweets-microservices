import { ERROR_LIST } from '@libs/contracts/utils/error-list';
import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_LIST.APIGATEWAY_BAD_PARAMETER,
          messages,
        });
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();

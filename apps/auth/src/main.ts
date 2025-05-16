import * as authServiceConfig from '@libs/contracts/auth/auth.config';
import { MicroserviceAllExceptionsFilter } from '@libs/contracts/general/exceptions-filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { port: authServiceConfig.SERVICE_PORT },
    },
  );

  app.useGlobalPipes(new ValidationPipe());

  // const reflector = app.get(Reflector);
  // app.useGlobalInterceptors(new EventResponseWrapperInterceptor(reflector));
  //
  app.useGlobalFilters(new MicroserviceAllExceptionsFilter());
  await app.listen();
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AuthModule } from './auth.module';
import authConfig from '../../../libs/contracts/auth/configs/auth.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: { port: authConfig.port },
    },
  );
  await app.listen();
}

bootstrap();

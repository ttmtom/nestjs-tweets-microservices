import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { appConfig } from './config';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: { port: appConfig.get('port') },
    },
  );
  await app.listen();
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import usersConfig from '../../../libs/contracts/users/configs/users.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: { port: usersConfig.port },
    },
  );
  await app.listen();
}

bootstrap();

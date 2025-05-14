import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { appConfig } from './config';
import { TweetsModule } from './tweets.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TweetsModule,
    {
      transport: Transport.TCP,
      options: {
        port: appConfig.get('port'),
      },
    },
  );
  await app.listen();
}

bootstrap();

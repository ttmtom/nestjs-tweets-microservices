import { NestFactory } from '@nestjs/core';
import { TweetsModule } from './tweets.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import tweetsConfig from '../../../libs/contracts/tweets/configs/tweets.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TweetsModule,
    {
      transport: Transport.TCP,
      options: {
        port: tweetsConfig.port,
      },
    },
  );
  await app.listen();
}

bootstrap();

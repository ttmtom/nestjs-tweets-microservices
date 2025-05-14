import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: { port: appConfig.get('port') },
    },
  );
  await app.listen();
}

bootstrap();

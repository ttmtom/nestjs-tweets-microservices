import * as authServiceConfig from '@libs/contracts/auth/auth.config';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    ClientsModule.register([
      {
        name: authServiceConfig.SERVICE_NAME,
        transport: Transport.TCP,
        options: {
          port: authServiceConfig.SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersModule],
})
export class AuthModule {}

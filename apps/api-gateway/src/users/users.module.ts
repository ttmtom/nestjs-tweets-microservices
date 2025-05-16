import * as usersServiceConfig from '@libs/contracts/users/users.config';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: usersServiceConfig.SERVICE_NAME,
        transport: Transport.TCP,
        options: {
          port: usersServiceConfig.SERVICE_PORT,
        },
      },
    ]),
  ],
  exports: [UsersService],
  providers: [UsersService],
})
export class UsersModule {}

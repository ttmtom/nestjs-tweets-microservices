import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICE_LIST.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST'),
            port: configService.get<number>('AUTH_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [AuthService],
  providers: [AuthService],
})
export class AuthModule {}

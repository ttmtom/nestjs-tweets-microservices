import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, Role, RolePermission, UserCredentials } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('AUTH_DB_HOST'),
        port: configService.get('AUTH_DB_PORT'),
        username: configService.get('AUTH_DB_USERNAME'),
        password: configService.get('AUTH_DB_PASSWORD'),
        database: 'postgres',
        entities: [Role, Permission, RolePermission, UserCredentials],
      }),
    }),
  ],
})
export class DatabaseModule {}

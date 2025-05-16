import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('USER_DB_HOST'),
        port: configService.get('USER_DB_PORT'),
        username: configService.get('USER_DB_USERNAME'),
        password: configService.get('USER_DB_PASSWORD'),
        database: 'postgres',
        entities: [User],
      }),
    }),
  ],
})
export class DatabaseModule {}

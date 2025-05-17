import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('TWEETS_DB_HOST'),
        port: configService.get('TWEETS_DB_PORT'),
        username: configService.get('TWEETS_DB_USERNAME'),
        password: configService.get('TWEETS_DB_PASSWORD'),
        database: 'postgres',
        entities: [Tweet],
      }),
    }),
  ],
})
export class DatabaseModule {}

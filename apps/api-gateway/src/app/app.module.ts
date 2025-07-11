import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { TweetsModule } from '../tweets/tweets.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateAdminCommand } from './create-admin.command';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    TweetsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CreateAdminCommand],
})
export class AppModule {}

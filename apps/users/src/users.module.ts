import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

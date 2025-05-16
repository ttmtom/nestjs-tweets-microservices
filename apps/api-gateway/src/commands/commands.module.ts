import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreateAdminCommand } from './create-admin.command';

@Module({
  imports: [AuthModule],
  providers: [CreateAdminCommand],
})
export class CommandsModule {}

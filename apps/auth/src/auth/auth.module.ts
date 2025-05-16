import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { UserCredentialRepository } from './user-credential.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserCredential])],
  controllers: [AuthController],
  providers: [UserCredentialRepository, AuthService, CryptoService],
})
export class AuthModule {}

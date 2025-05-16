import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { UserCredentialRepository } from './user-credential.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCredential]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('APP_JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('APP_JWT_EXPIRATION'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [UserCredentialRepository, AuthService, CryptoService],
})
export class AuthModule {}

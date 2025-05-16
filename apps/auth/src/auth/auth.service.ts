import { RegisterAuthDto } from '@libs/contracts/auth/dto';
import { Inject, Injectable } from '@nestjs/common';
import { UserCredential } from '../database/entities';
import { CryptoService } from './crypto.service';
import { UserCredentialRepository } from './user-credential.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private readonly repository: UserCredentialRepository,
    @Inject()
    private readonly cryptoService: CryptoService,
  ) {}

  async userAuthRegister(registerAuthDto: RegisterAuthDto) {
    console.log('--- userAuthRegister', registerAuthDto);
    const hashedPwd = await this.cryptoService.hashPassword(
      registerAuthDto.password,
    );
    const newUserCred = new UserCredential(registerAuthDto.userId, hashedPwd);
    console.log(newUserCred);
    return this.repository.insertNewUserCredential(newUserCred);
  }
}

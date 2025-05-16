import { RegisterAuthDto } from '@libs/contracts/auth/dto';
import { LoginAuthDto } from '@libs/contracts/auth/dto/login-auth.dto';
import { IJwtPayload } from '@libs/contracts/auth/interfaces/jwt-payload.interface';
import { ERROR_LIST } from '@libs/contracts/utils/error-list';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCredential } from '../database/entities';
import { CryptoService } from './crypto.service';
import { UserCredentialRepository } from './user-credential.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject()
    private readonly repository: UserCredentialRepository,
    @Inject()
    private readonly cryptoService: CryptoService,
    @Inject()
    private readonly jwtServie: JwtService,
  ) {}

  async userAuthRegister(registerAuthDto: RegisterAuthDto) {
    this.logger.log(`userAuthRegister ${registerAuthDto.userId}`);
    const hashedPwd = await this.cryptoService.hashPassword(
      registerAuthDto.password,
    );
    const newUserCred = new UserCredential(registerAuthDto.userId, hashedPwd);
    this.logger.log(`userAuthRegister successes ${newUserCred.userId}`);
    return this.repository.insertNewUserCredential(newUserCred);
  }

  async userLogin(loginAuthDto: LoginAuthDto) {
    this.logger.log(`userLogin ${loginAuthDto.userId}`);
    const userCred = await this.repository.getUserCredentialByUserId(
      loginAuthDto.userId,
    );

    if (!userCred) {
      this.logger.log(`userLogin failures ${loginAuthDto.userId}`);
      throw new NotFoundException({
        message: 'User not found',
        code: ERROR_LIST.AUTH_USER_CRED_NOT_FOUND,
      });
    }

    const isMatched = await this.cryptoService.comparePassword(
      loginAuthDto.password,
      userCred.hashedPassword,
    );

    if (!isMatched) {
      this.logger.log(`userLogin password invalid  ${loginAuthDto.userId}`);
      throw new UnauthorizedException({
        message: 'Invalid password',
        code: ERROR_LIST.AUTH_USER_UNAUTHORIZED,
      });
    }
    const payload: IJwtPayload = {
      sub: userCred.userId,
      username: loginAuthDto.username,
      role: userCred.role,
    };
    const token = await this.jwtServie.signAsync(payload);

    return {
      userId: userCred.userId,
      role: userCred.role,
      token,
    };
  }
}

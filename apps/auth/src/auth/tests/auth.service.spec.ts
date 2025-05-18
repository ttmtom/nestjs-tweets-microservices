import {
  LoginAuthDto,
  RegisterAuthDto,
  ValidateTokenDto,
} from '@libs/contracts/auth/dto';
import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces/jwt-payload.interface';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserCredential } from '../../database/entities';
import { AuthService } from '../auth.service';
import { CryptoService } from '../crypto.service';
import { UserCredentialRepository } from '../user-credential.repository';

describe('AuthService', () => {
  let service: AuthService;
  let repository: UserCredentialRepository;
  let cryptoService: CryptoService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserCredentialRepository,
          useValue: {
            insertNewUserCredential: jest.fn(),
            getUserCredentialByUserId: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<UserCredentialRepository>(UserCredentialRepository);
    cryptoService = module.get<CryptoService>(CryptoService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userAuthRegister', () => {
    it('should register a new user', async () => {
      const registerAuthDto: RegisterAuthDto = {
        userId: 'testUser',
        password: 'password',
        role: EUserRole.USER,
      };
      const hashedPassword = 'hashedPassword';
      const newUserCredential = new UserCredential(
        registerAuthDto.userId,
        hashedPassword,
        registerAuthDto.role,
      );

      (cryptoService.hashPassword as jest.Mock).mockResolvedValue(
        hashedPassword,
      );
      (repository.insertNewUserCredential as jest.Mock).mockResolvedValue(
        newUserCredential,
      );

      const result = await service.userAuthRegister(registerAuthDto);

      expect(cryptoService.hashPassword).toHaveBeenCalledWith(
        registerAuthDto.password,
      );
      expect(repository.insertNewUserCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: registerAuthDto.userId,
          hashedPassword,
          role: registerAuthDto.role,
        }),
      );
      expect(result).toEqual(newUserCredential);
    });
  });

  describe('userLogin', () => {
    it('should login a user with valid credentials', async () => {
      const loginAuthDto: LoginAuthDto = {
        userId: 'testUser',
        password: 'password',
        idHash: 'someHash',
        username: 'testuser',
      };
      const hashedPassword = 'hashedPassword';
      const userCredential = new UserCredential(
        loginAuthDto.userId,
        hashedPassword,
        EUserRole.USER,
      );
      const token = 'jwtToken';
      const jwtPayload: IJwtPayload = {
        sub: userCredential.userId,
        idHash: loginAuthDto.idHash,
        username: loginAuthDto.username,
        role: userCredential.role,
      };

      (repository.getUserCredentialByUserId as jest.Mock).mockResolvedValue(
        userCredential,
      );
      (cryptoService.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

      const result = await service.userLogin(loginAuthDto);

      expect(repository.getUserCredentialByUserId).toHaveBeenCalledWith(
        loginAuthDto.userId,
      );
      expect(cryptoService.comparePassword).toHaveBeenCalledWith(
        loginAuthDto.password,
        hashedPassword,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(jwtPayload);
      expect(result).toEqual({
        userId: userCredential.userId,
        role: userCredential.role,
        token,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const loginAuthDto: LoginAuthDto = {
        userId: 'nonExistentUser',
        password: 'password',
        idHash: 'someHash',
        username: 'nonExistentUser',
      };

      (repository.getUserCredentialByUserId as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.userLogin(loginAuthDto)).rejects.toThrow(
        new NotFoundException({
          message: 'User not found',
          code: ERROR_LIST.AUTH_USER_CRED_NOT_FOUND,
        }),
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginAuthDto: LoginAuthDto = {
        userId: 'testUser',
        password: 'wrongPassword',
        idHash: 'someHash',
        username: 'testuser',
      };
      const hashedPassword = 'hashedPassword';
      const userCredential = new UserCredential(
        loginAuthDto.userId,
        hashedPassword,
        EUserRole.USER,
      );

      (repository.getUserCredentialByUserId as jest.Mock).mockResolvedValue(
        userCredential,
      );
      (cryptoService.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.userLogin(loginAuthDto)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid password',
          code: ERROR_LIST.AUTH_USER_UNAUTHORIZED,
        }),
      );
    });
  });

  describe('validateToken', () => {
    it('should return payload if token is valid', async () => {
      const validateTokenDto: ValidateTokenDto = { token: 'validToken' };
      const payload: IJwtPayload = {
        sub: 'testUser',
        idHash: 'someHash',
        username: 'testuser',
        role: EUserRole.USER,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);

      const result = await service.validateToken(validateTokenDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        validateTokenDto.token,
      );
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const validateTokenDto: ValidateTokenDto = { token: 'invalidToken' };

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        service.validateToken(validateTokenDto),
      ).rejects.toThrowError(
        new UnauthorizedException({
          message: 'Invalid token',
          code: ERROR_LIST.AUTH_USER_UNAUTHORIZED,
        }),
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role if user exists', async () => {
      const userId = 'testUser';
      const role = 'user';
      const userCredential = new UserCredential(
        userId,
        'hashedPassword',
        EUserRole.USER,
      );

      (repository.getUserCredentialByUserId as jest.Mock).mockResolvedValue(
        userCredential,
      );

      const result = await service.getUserRole(userId);

      expect(repository.getUserCredentialByUserId).toHaveBeenCalledWith(userId);
      expect(result).toBe(role);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonExistentUser';

      (repository.getUserCredentialByUserId as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.getUserRole(userId)).rejects.toThrow(
        new NotFoundException({
          message: 'User not found',
          code: ERROR_LIST.AUTH_USER_CRED_NOT_FOUND,
        }),
      );
    });
  });
});

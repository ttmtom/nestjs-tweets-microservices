import {
  GetUserRoleDto,
  LoginAuthDto,
  RegisterAuthDto,
  ValidateTokenDto,
} from '@libs/contracts/auth/dto';
import { EUserRole } from '@libs/contracts/auth/enums';
import {
  TGetUserRoleResponse,
  TLoginAuthResponse,
  TRegisterAuthResponse,
  TValidateTokenResponse,
} from '@libs/contracts/auth/response';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            userAuthRegister: jest.fn(),
            userLogin: jest.fn(),
            validateToken: jest.fn(),
            getUserRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call userAuthRegister and return the result', async () => {
      const registerAuthDto: RegisterAuthDto = {
        userId: 'testUserId',
        password: 'testPassword',
        role: EUserRole.USER,
      };
      const expectedResult: TRegisterAuthResponse = {
        userId: 'testUserId',
        role: EUserRole.USER,
      };
      (service.userAuthRegister as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(registerAuthDto);

      expect(service.userAuthRegister).toHaveBeenCalledWith(registerAuthDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call userLogin and return the token', async () => {
      const loginAuthDto: LoginAuthDto = {
        userId: 'testUserId',
        password: 'testPassword',
        idHash: '',
        username: '',
      };
      const expectedResult: TLoginAuthResponse = {
        token: 'testToken',
        userId: '',
        role: EUserRole.ADMIN,
      };
      (service.userLogin as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.login(loginAuthDto);

      expect(service.userLogin).toHaveBeenCalledWith(loginAuthDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateToken', () => {
    it('should call validateToken and return the validation result', async () => {
      const validateTokenDto: ValidateTokenDto = { token: 'testToken' };
      const userJwtPayload = {
        sub: 'user-id',
        idHash: 'user-hashed-id',
        username: 'username',
        role: EUserRole.USER,
      };
      const expectedResult: TValidateTokenResponse = {
        isValid: true,
        user: userJwtPayload,
      };
      (service.validateToken as jest.Mock).mockResolvedValue(userJwtPayload);

      const result = await controller.validateToken(validateTokenDto);

      expect(service.validateToken).toHaveBeenCalledWith(validateTokenDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return isValid: false if token is invalid', async () => {
      const validateTokenDto: ValidateTokenDto = { token: 'invalidToken' };
      const expectedResult: TValidateTokenResponse = {
        isValid: false,
        user: undefined,
      };
      (service.validateToken as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.validateToken(validateTokenDto);

      expect(service.validateToken).toHaveBeenCalledWith(validateTokenDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserRole', () => {
    it('should call getUserRole and return the role', async () => {
      const getUserRoleDto: GetUserRoleDto = { userId: 'testUserId' };
      const expectedResult: TGetUserRoleResponse = { role: EUserRole.USER };
      (service.getUserRole as jest.Mock).mockResolvedValue(EUserRole.USER);

      const result = await controller.getUserRole(getUserRoleDto);

      expect(service.getUserRole).toHaveBeenCalledWith('testUserId');
      expect(result).toEqual(expectedResult);
    });
  });
});

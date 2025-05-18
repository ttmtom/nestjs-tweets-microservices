import { AUTH_PATTERN } from '@libs/contracts/auth/auth.pattern';
import { LoginAuthDto, RegisterAuthDto } from '@libs/contracts/auth/dto';
import { EUserRole } from '@libs/contracts/auth/enums';
import {
  TGetUserRoleResponse,
  TLoginAuthResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let authClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SERVICE_LIST.AUTH_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authClient = module.get<ClientProxy>(SERVICE_LIST.AUTH_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertUserAuthCred', () => {
    it('should call authClient.send with correct parameters and return the result', async () => {
      const registerAuthDto: RegisterAuthDto = {
        userId: 'test-user-id',
        password: 'password',
        role: EUserRole.USER,
      };
      const expectedResponse: TRegisterAuthResponse = {
        role: EUserRole.USER,
        userId: 'test-user-id',
      };

      (authClient.send as jest.Mock).mockReturnValue(of(expectedResponse));

      const result = await service.insertUserAuthCred(registerAuthDto);

      expect(authClient.send).toHaveBeenCalledWith(
        AUTH_PATTERN.AUTH_REGISTER,
        registerAuthDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('userLogin', () => {
    it('should call authClient.send with correct parameters and return the result', async () => {
      const loginAuthDto: LoginAuthDto = {
        userId: 'test-user-id',
        password: 'password',
        idHash: '',
        username: '',
      };
      const expectedResponse: TLoginAuthResponse = {
        token: 'test-token',
        role: EUserRole.USER,
        userId: '',
      };

      (authClient.send as jest.Mock).mockReturnValue(of(expectedResponse));

      const result = await service.userLogin(loginAuthDto);

      expect(authClient.send).toHaveBeenCalledWith(
        AUTH_PATTERN.AUTH_LOGIN,
        loginAuthDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserRole', () => {
    it('should call authClient.send with correct parameters and return the result', async () => {
      const userId = 'test-user-id';
      const expectedResponse: TGetUserRoleResponse = { role: EUserRole.USER };

      (authClient.send as jest.Mock).mockReturnValue(of(expectedResponse));

      const result = await service.getUserRole(userId);

      expect(authClient.send).toHaveBeenCalledWith(
        AUTH_PATTERN.AUTH_GET_USER_ROLE,
        { userId },
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});

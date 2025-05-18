import { EUserRole } from '@libs/contracts/auth/enums';
import {
  TLoginAuthResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SuccessResponse } from '@libs/contracts/general/dto';
import {
  TGetByUsernameResponse,
  TRegisterUserResponse,
} from '@libs/contracts/users/response';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { AppService } from '../app.service';
import { LoginDto, RegisterDto } from '../dto';

describe('AppService', () => {
  let appService: AppService;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: UsersService,
          useValue: {
            userRegistration: jest.fn(),
            userRegistrationRevert: jest.fn(),
            getUserByUsername: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            insertUserAuthCred: jest.fn(),
            userLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };

      const mockUserResponse: SuccessResponse<TRegisterUserResponse> = {
        data: {
          id: 'user-id',
          idHash: 'user-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      const mockAuthResponse: SuccessResponse<TRegisterAuthResponse> = {
        data: {
          role: EUserRole.USER,
          userId: '',
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      (usersService.userRegistration as jest.Mock).mockResolvedValue(
        mockUserResponse,
      );
      (authService.insertUserAuthCred as jest.Mock).mockResolvedValue(
        mockAuthResponse,
      );

      const result = await appService.register(registerDto);

      expect(usersService.userRegistration).toHaveBeenCalledWith({
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        dateOfBirth: registerDto.dateOfBirth,
      });
      expect(authService.insertUserAuthCred).toHaveBeenCalledWith({
        userId: mockUserResponse.data.id,
        password: registerDto.password,
        role: EUserRole.USER,
      });
      expect(result).toEqual({
        user: mockUserResponse.data,
        auth: mockAuthResponse.data,
      });
    });

    it('should revert user registration if auth credential creation fails', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };

      const mockUserResponse: SuccessResponse<TRegisterUserResponse> = {
        data: {
          id: 'user-id',
          idHash: 'user-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      (usersService.userRegistration as jest.Mock).mockResolvedValue(
        mockUserResponse,
      );
      (authService.insertUserAuthCred as jest.Mock).mockRejectedValue(
        new Error('Auth error'),
      );

      await expect(appService.register(registerDto)).rejects.toThrow(
        'Auth error',
      );
      expect(usersService.userRegistrationRevert).toHaveBeenCalledWith(
        registerDto,
      );
    });

    it('should throw an error if user registration fails', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };

      (usersService.userRegistration as jest.Mock).mockRejectedValue(
        new Error('User error'),
      );

      await expect(appService.register(registerDto)).rejects.toThrow(
        'User error',
      );
      expect(authService.insertUserAuthCred).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password',
      };

      const mockUserResponse: SuccessResponse<TGetByUsernameResponse> = {
        data: {
          id: 'user-id',
          idHash: 'user-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      const mockAuthResponse: SuccessResponse<TLoginAuthResponse> = {
        data: {
          token: 'jwt-token',
          role: EUserRole.USER,
          userId: '',
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      (usersService.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUserResponse,
      );
      (authService.userLogin as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await appService.login(loginDto);

      expect(usersService.getUserByUsername).toHaveBeenCalledWith({
        username: loginDto.username,
      });
      expect(authService.userLogin).toHaveBeenCalledWith({
        userId: mockUserResponse.data.id,
        idHash: mockUserResponse.data.idHash,
        username: mockUserResponse.data.username,
        password: loginDto.password,
      });
      expect(result).toEqual({
        userData: mockUserResponse.data,
        authData: mockAuthResponse.data,
      });
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      const loginDto: LoginDto = {
        username: 'invaliduser',
        password: 'password',
      };

      (usersService.getUserByUsername as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      await expect(appService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid username or password',
          code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
        }),
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockUserResponse: SuccessResponse<TGetByUsernameResponse> = {
        data: {
          id: 'user-id',
          idHash: 'user-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      (usersService.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUserResponse,
      );
      (authService.userLogin as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(appService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid username or password',
          code: ERROR_LIST.APIGATEWAY_UNAUTHORIZED,
        }),
      );
    });
  });
});

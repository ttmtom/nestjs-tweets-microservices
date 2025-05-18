import { EUserRole } from '@libs/contracts/auth/enums';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { LoginDto, RegisterDto } from '../dto';
import { LoginResponse, RegisterResponse } from '../response';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('register', () => {
    it('should call appService.register with the provided RegisterDto and return a RegisterResponse', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };
      const expectedResult = {
        user: {
          id: 'some-uuid-4-id',
          idHash: 'some-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        auth: {
          role: EUserRole.USER,
          userId: 'some-uuid-4-id',
        },
      };
      const expectedResponse = new RegisterResponse(
        expectedResult.user,
        expectedResult.auth,
      );

      (appService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await appController.register(registerDto);

      expect(appService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should call appService.login with the provided LoginDto and return a LoginResponse', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password',
      };
      const expectedResult = {
        userData: {
          idHash: 'some-id-hash',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        authData: {
          role: EUserRole.USER,
          token: 'some-jwt-token',
        },
      };
      const expectedResponse: LoginResponse = {
        user: {
          id: expectedResult.userData.idHash,
          username: expectedResult.userData.username,
          firstName: expectedResult.userData.firstName,
          lastName: expectedResult.userData.lastName,
          dateOfBirth: expectedResult.userData.dateOfBirth,
          role: expectedResult.authData.role,
          createdAt: expectedResult.userData.createdAt,
          updatedAt: expectedResult.userData.updatedAt,
        },
        token: expectedResult.authData.token,
      };

      (appService.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await appController.login(loginDto);

      expect(appService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});

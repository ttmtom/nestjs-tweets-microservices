import { EUserRole } from '@libs/contracts/auth/enums';
import {
  TGetUserRoleResponse,
  TRegisterAuthResponse,
} from '@libs/contracts/auth/response';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto, SuccessResponse } from '@libs/contracts/general/dto';
import { TWEETS_PATTERN } from '@libs/contracts/tweets/tweets.pattern';
import { GetByUsernameDto, RegisterUserDto } from '@libs/contracts/users/dto';
import {
  TGetByUsernameResponse,
  TGetUsersResponse,
  TRegisterUserResponse,
  TSoftDeleteUserResponseDTO,
  TUpdateUserResponse,
} from '@libs/contracts/users/response';
import { USERS_PATTERN } from '@libs/contracts/users/users.pattern';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CreateUserDto, UpdateUserGatewayDto } from '../dto';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersClient: ClientProxy;
  let authClient: ClientProxy;
  let tweetsClient: ClientProxy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: AuthService,
          useValue: {
            getUserRole: jest.fn(),
            insertUserAuthCred: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.USERS_SERVICE,
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.AUTH_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.TWEETS_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersClient = module.get<ClientProxy>(SERVICE_LIST.USERS_SERVICE);
    authClient = module.get<ClientProxy>(SERVICE_LIST.AUTH_SERVICE);
    tweetsClient = module.get<ClientProxy>(SERVICE_LIST.TWEETS_SERVICE);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userRegistration', () => {
    it('should register a user', async () => {
      const userDto: RegisterUserDto = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };
      const expectedResponse: SuccessResponse<TRegisterUserResponse> = {
        data: {
          id: 'user123',
          idHash: 'hash123',
          ...userDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };
      (usersClient.send as jest.Mock).mockReturnValue(of(expectedResponse));

      const result = await service.userRegistration(userDto);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.CREATE_NEW_USER,
        userDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('userRegistrationRevert', () => {
    it('should emit an event to revert user registration', () => {
      const userDto: RegisterUserDto = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };

      service.userRegistrationRevert(userDto);

      expect(usersClient.emit).toHaveBeenCalledWith(
        USERS_PATTERN.REVERT_CREATE_NEW_USER,
        userDto,
      );
    });
  });

  describe('getUserByUsername', () => {
    it('should get a user by username', async () => {
      const getByUsernameDto: GetByUsernameDto = { username: 'testuser' };
      const expectedResponse: SuccessResponse<TGetByUsernameResponse> = {
        data: {
          id: 'user123',
          idHash: 'hash123',
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
      (usersClient.send as jest.Mock).mockReturnValue(of(expectedResponse));

      const result = await service.getUserByUsername(getByUsernameDto);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.GET_USER_BY_USERNAME,
        getByUsernameDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserByIdHash', () => {
    it('should get a user by idHash', async () => {
      const idHash = 'hash123';
      const mockUserData = {
        id: 'user123',
        idHash,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockRoleData = { role: 'user' };

      (usersClient.send as jest.Mock).mockReturnValueOnce(
        of({ data: mockUserData }),
      );
      (authService.getUserRole as jest.Mock).mockResolvedValue({
        data: mockRoleData,
      });

      const result = await service.getUserByIdHash(idHash);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.GET_USER_BY_HASH_ID,
        { idHash },
      );
      expect(authService.getUserRole).toHaveBeenCalledWith('user123');
      expect(result).toEqual({ ...mockUserData, role: 'user' });
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user and emit a tweet deletion event', async () => {
      const idHash = 'hash123';
      const userId = 'user123';
      const mockResponse: SuccessResponse<TSoftDeleteUserResponseDTO> = {
        success: true,
        data: {
          success: true,
          user: {
            id: userId,
            idHash: '',
            username: '',
            firstName: '',
            lastName: '',
            dateOfBirth: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        statusCode: 0,
        message: '',
        timestamp: '',
      };
      (usersClient.send as jest.Mock).mockReturnValue(of(mockResponse));

      const result = await service.softDeleteUser(idHash);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.SOFT_DELETE_USER,
        { idHash },
      );
      expect(tweetsClient.emit).toHaveBeenCalledWith(
        TWEETS_PATTERN.SOFT_DELETE_TWEET_BY_AUTHOR,
        { authorId: userId },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createUser', () => {
    it('should create a user and auth credentials', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date(),
        role: EUserRole.USER,
      };
      const mockUserResponse: SuccessResponse<TRegisterUserResponse> = {
        data: {
          id: 'user456',
          idHash: 'hash456',
          username: 'newuser',
          firstName: 'New',
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
          userId: 'user456',
        },
        success: true,
        statusCode: 0,
        message: '',
        timestamp: '',
      };

      (usersClient.send as jest.Mock).mockReturnValue(of(mockUserResponse));
      (authService.insertUserAuthCred as jest.Mock).mockResolvedValue({
        data: mockAuthResponse.data,
      });

      const result = await service.createUser(createUserDto);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.CREATE_NEW_USER,
        expect.any(Object),
      );
      expect(authService.insertUserAuthCred).toHaveBeenCalledWith({
        userId: 'user456',
        password: 'password',
        role: 'user',
      });
      expect(result).toEqual({
        user: mockUserResponse.data,
        auth: mockAuthResponse.data,
      });
    });

    it('should revert user registration if auth credential creation fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date(),
        role: EUserRole.USER,
      };
      const mockUserResponse: SuccessResponse<TRegisterUserResponse> = {
        data: {
          id: 'user456',
          idHash: 'hash456',
          username: 'newuser',
          firstName: 'New',
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

      (usersClient.send as jest.Mock).mockReturnValue(of(mockUserResponse));

      (authService.insertUserAuthCred as jest.Mock).mockRejectedValue(
        new Error('Auth error'),
      );
      const revertSpy = jest.spyOn(service, 'userRegistrationRevert');

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Auth error',
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.CREATE_NEW_USER,
        expect.anything(),
      );

      expect(revertSpy).toHaveBeenCalledWith(expect.any(RegisterUserDto));
    });

    it('should throw error and revert registration if user registration fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date(),
        role: EUserRole.USER,
      };
      const mockError = new Error('User registration failed');

      (usersClient.send as jest.Mock).mockReturnValue(
        throwError(() => mockError),
      );

      const revertSpy = jest.spyOn(service, 'userRegistrationRevert');

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'User registration failed',
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.CREATE_NEW_USER,
        expect.anything(),
      );
      expect(revertSpy).toHaveBeenCalledWith(expect.any(RegisterUserDto));
    });
  });

  describe('getUsers', () => {
    it('should get users with roles', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockUsers: TGetUsersResponse = {
        data: [
          {
            id: 'user1',
            idHash: 'hash1',
            username: 'user1',
            firstName: 'User',
            lastName: 'One',
            dateOfBirth: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'user2',
            idHash: 'hash2',
            username: 'user2',
            firstName: 'User',
            lastName: 'Two',
            dateOfBirth: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        totalCount: 0,
        currentPage: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
      const mockRole1: TGetUserRoleResponse = { role: EUserRole.USER };
      const mockRole2: TGetUserRoleResponse = { role: EUserRole.ADMIN };

      (usersClient.send as jest.Mock).mockReturnValue(of({ data: mockUsers }));
      (authClient.send as jest.Mock)
        .mockReturnValueOnce(of({ data: mockRole1 }))
        .mockReturnValueOnce(of({ data: mockRole2 }));

      const result = await service.getUsers(paginationDto);

      expect(usersClient.send).toHaveBeenCalledWith(
        USERS_PATTERN.GET_USERS,
        paginationDto,
      );
      expect(authClient.send).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        users: mockUsers,
        userAuths: { user1: 'user', user2: 'admin' },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserGatewayDto = {
        firstName: 'Updated',
        atLeastOne: true,
      };
      const idHash = 'hash123';
      const expectedResponse: TUpdateUserResponse = {
        id: 'user123',
        idHash,
        username: 'testuser',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersClient.send as jest.Mock).mockReturnValue(
        of({ data: expectedResponse }),
      );

      const result = await service.updateUser(updateUserDto, idHash);

      expect(usersClient.send).toHaveBeenCalledWith(USERS_PATTERN.UPDATE_USER, {
        ...updateUserDto,
        idHash,
      });
      expect(result).toEqual(expectedResponse);
    });
  });
});

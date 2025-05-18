import { EUserRole } from '@libs/contracts/auth/enums';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { SERVICE_LIST } from '@libs/contracts/constants/service-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterResponse } from '../../app/response';
import { CreateUserDto, UpdateUserGatewayDto } from '../dto';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsers: jest.fn(),
            createUser: jest.fn(),
            getUserByIdHash: jest.fn(),
            updateUser: jest.fn(),
            softDeleteUser: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.AUTH_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: SERVICE_LIST.USERS_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return users with formatted data', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockUsersData = {
        users: {
          data: [
            {
              id: 'user1',
              idHash: 'user1Hash',
              username: 'user1name',
              firstName: 'First',
              lastName: 'Last',
              dateOfBirth: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        userAuths: { user1: EUserRole.USER },
      };
      (service.getUsers as jest.Mock).mockResolvedValue(mockUsersData);

      const result = await controller.getUsers(paginationDto);

      expect(service.getUsers).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        data: [
          {
            id: 'user1Hash',
            username: 'user1name',
            firstName: 'First',
            lastName: 'Last',
            dateOfBirth: mockUsersData.users.data[0].dateOfBirth,
            role: EUserRole.USER,
            createdAt: mockUsersData.users.data[0].createdAt,
            updatedAt: mockUsersData.users.data[0].updatedAt,
          },
        ],
      });
    });
  });

  describe('createUser', () => {
    it('should create a user and return a RegisterResponse', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date(),
        role: EUserRole.USER,
      };
      const mockResult = {
        user: {
          id: 'newuser',
          idHash: 'newUserHash',
          username: 'newuser',
          firstName: 'New',
          lastName: 'User',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        auth: {
          userId: 'newuser',
          role: EUserRole.USER,
        },
      };
      (service.createUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.createUser(createUserDto);

      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(
        new RegisterResponse(mockResult.user, mockResult.auth),
      );
    });
  });

  describe('getUserById', () => {
    const mockUser = {
      id: 'user1',
      idHash: 'user1Hash',
      username: 'user1name',
      firstName: 'First',
      lastName: 'Last',
      dateOfBirth: new Date(),
      role: EUserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a user by idHash for the same user', async () => {
      (service.getUserByIdHash as jest.Mock).mockResolvedValue(mockUser);
      const userPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      const result = await controller.getUserById('user1Hash', userPayload);

      expect(service.getUserByIdHash).toHaveBeenCalledWith('user1Hash');
      expect(result).toEqual({
        id: 'user1Hash',
        username: 'user1name',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: mockUser.dateOfBirth,
        role: EUserRole.USER,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return a user by idHash for an admin', async () => {
      (service.getUserByIdHash as jest.Mock).mockResolvedValue(mockUser);
      const adminPayload = {
        sub: 'admin1',
        username: 'admin1name',
        role: EUserRole.ADMIN,
        idHash: 'admin1Hash',
      };

      const result = await controller.getUserById('user1Hash', adminPayload);

      expect(service.getUserByIdHash).toHaveBeenCalledWith('user1Hash');
      expect(result).toEqual({
        id: 'user1Hash',
        username: 'user1name',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: mockUser.dateOfBirth,
        role: EUserRole.USER,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw ForbiddenException for a different user', async () => {
      const otherUserPayload = {
        sub: 'user2',
        username: 'user2name',
        role: EUserRole.USER,
        idHash: 'user2Hash',
      };

      await expect(
        controller.getUserById('user1Hash', otherUserPayload),
      ).rejects.toThrowError(
        new ForbiddenException({
          message: 'Forbidden',
          code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
        }),
      );
      expect(service.getUserByIdHash).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const mockUpdatedUser = {
      id: 'user1',
      idHash: 'user1Hash',
      username: 'updatedname',
      firstName: 'Updated',
      lastName: 'User',
      dateOfBirth: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a user for the same user', async () => {
      const updateUserDto: UpdateUserGatewayDto = {
        firstName: 'Updated',
        atLeastOne: true,
      };
      (service.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const userPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      const result = await controller.updateUser(
        'user1Hash',
        updateUserDto,
        userPayload,
      );

      expect(service.updateUser).toHaveBeenCalledWith(
        updateUserDto,
        'user1Hash',
      );
      expect(result).toEqual({
        id: 'user1Hash',
        username: 'updatedname',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: mockUpdatedUser.dateOfBirth,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
      });
    });

    it('should update a user for an admin', async () => {
      const updateUserDto: UpdateUserGatewayDto = {
        firstName: 'Updated',
        atLeastOne: true,
      };
      (service.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const adminPayload = {
        sub: 'admin1',
        username: 'admin1name',
        role: EUserRole.ADMIN,
        idHash: 'admin1Hash',
      };

      const result = await controller.updateUser(
        'user1Hash',
        updateUserDto,
        adminPayload,
      );

      expect(service.updateUser).toHaveBeenCalledWith(
        updateUserDto,
        'user1Hash',
      );
      expect(result).toEqual({
        id: 'user1Hash',
        username: 'updatedname',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: mockUpdatedUser.dateOfBirth,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
      });
    });

    it('should throw BadRequestException if no data is provided', async () => {
      const updateUserDto: UpdateUserGatewayDto = {
        atLeastOne: false,
      };
      const userPayload = {
        sub: 'user1',
        username: 'user1name',
        role: EUserRole.USER,
        idHash: 'user1Hash',
      };

      await expect(
        controller.updateUser('user1Hash', updateUserDto, userPayload),
      ).rejects.toThrowError(
        new BadRequestException({
          message: 'No data provided',
          code: ERROR_LIST.APIGATEWAY_NO_DATA_PROVIDED,
        }),
      );
      expect(service.updateUser).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for a different user', async () => {
      const updateUserDto: UpdateUserGatewayDto = {
        firstName: 'Updated',
        atLeastOne: true,
      };
      const otherUserPayload = {
        sub: 'user2',
        username: 'user2name',
        role: EUserRole.USER,
        idHash: 'user2Hash',
      };

      await expect(
        controller.updateUser('user1Hash', updateUserDto, otherUserPayload),
      ).rejects.toThrowError(
        new ForbiddenException({
          message: 'Forbidden',
          code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
        }),
      );
      expect(service.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should call softDeleteUser with the provided id', async () => {
      const id = 'user1';

      await controller.deleteUser(id);

      expect(service.softDeleteUser).toHaveBeenCalledWith(id);
    });
  });
});

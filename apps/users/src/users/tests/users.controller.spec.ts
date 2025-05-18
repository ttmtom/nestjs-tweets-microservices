import { PaginationDto } from '@libs/contracts/general/dto';
import {
  GetByIdHashDto,
  GetByUsernameDto,
  GetUserByIdDto,
  RegisterUserDto,
  RevertRegisterUserDto,
  SoftDeleteUserDto,
  UpdateUserDto,
} from '@libs/contracts/users/dto';
import {
  TGetByIdHashResponse,
  TGetByUsernameResponse,
  TGetUserByIdResponse,
  TGetUsersResponse,
  TRegisterUserResponse,
  TRevertRegisterUserResponse,
  TSoftDeleteUserResponseDTO,
  TUpdateUserResponse,
} from '@libs/contracts/users/response';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../database/entities';
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
            createNewUser: jest.fn(),
            revertNewUser: jest.fn(),
            getUserByUsername: jest.fn(),
            getUserByIdHash: jest.fn(),
            softDelete: jest.fn(),
            getUsers: jest.fn(),
            updateUser: jest.fn(),
            getUserById: jest.fn(),
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

  describe('createNewUser', () => {
    it('should call createNewUser and return the result', async () => {
      const registerUserDto: RegisterUserDto = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
      };
      const expectedResult: TRegisterUserResponse = {
        id: 'user123',
        idHash: 'hash123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (service.createNewUser as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.createNewUser(registerUserDto);

      expect(service.createNewUser).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('revertNewUser', () => {
    it('should call revertNewUser and return the result', async () => {
      const revertRegisterUserDto: RevertRegisterUserDto = {
        username: 'testuser',
      };
      const expectedResult: TRevertRegisterUserResponse = {
        success: true,
        username: 'testuser',
      };
      (service.revertNewUser as jest.Mock).mockResolvedValue(true);
      const result = await controller.revertNewUser(revertRegisterUserDto);

      expect(service.revertNewUser).toHaveBeenCalledWith(revertRegisterUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserByUsername', () => {
    it('should call getUserByUsername and return the result', async () => {
      const getByUsernameDto: GetByUsernameDto = { username: 'testuser' };
      const expectedResult: TGetByUsernameResponse = {
        id: 'user123',
        idHash: 'hash123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (service.getUserByUsername as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getUserByUsername(getByUsernameDto);

      expect(service.getUserByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserByHashId', () => {
    it('should call getUserByHashId and return the result', async () => {
      const getByIdHashDto: GetByIdHashDto = { idHash: 'hash123' };
      const expectedResult: TGetByIdHashResponse = {
        id: 'user123',
        idHash: 'hash123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (service.getUserByIdHash as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getUserByHashId(getByIdHashDto);

      expect(service.getUserByIdHash).toHaveBeenCalledWith('hash123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('softDeleteUser', () => {
    it('should call softDelete and return the result', async () => {
      const softDeleteDto: SoftDeleteUserDto = { idHash: 'hash123' };
      const mockUser: User = {
        id: 'user123',
        idHash: 'hash123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      const expectedResult: TSoftDeleteUserResponseDTO = {
        success: true,
        user: mockUser,
      };
      (service.softDelete as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.softDeleteUser(softDeleteDto);

      expect(service.softDelete).toHaveBeenCalledWith('hash123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUsers', () => {
    it('should call getUsers and return the result', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult: TGetUsersResponse = {
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
        ],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      (service.getUsers as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getUsers(paginationDto);

      expect(service.getUsers).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should call updateUser and return the result', async () => {
      const updateUserDto: UpdateUserDto = {
        idHash: 'hash123',
        firstName: 'Updated',
        lastName: 'User',
      };
      const expectedResult: TUpdateUserResponse = {
        id: 'user123',
        idHash: 'hash123',
        username: 'testuser',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (service.updateUser as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.updateUser(updateUserDto);

      expect(service.updateUser).toHaveBeenCalledWith(updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserById', () => {
    it('should call getUserById and return the result', async () => {
      const getUserByIdDto: GetUserByIdDto = { id: 'user123' };
      const expectedResult: TGetUserByIdResponse = {
        username: 'testuser',
        id: '',
        idHash: '',
        firstName: '',
        lastName: '',
        dateOfBirth: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
      (service.getUserById as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getUserById(getUserByIdDto);

      expect(service.getUserById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(expectedResult);
    });
  });
});

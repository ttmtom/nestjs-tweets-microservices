import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  RegisterUserDto,
  RevertRegisterUserDto,
  UpdateUserDto,
} from '@libs/contracts/users/dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../database/entities';
import { UsersRepository } from '../users.repository';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            isUserExists: jest.fn(),
            insert: jest.fn(),
            getUserByUsername: jest.fn(),
            getUserByIdHash: jest.fn(),
            getUserById: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewUser', () => {
    it('should create a new user', async () => {
      const registerUserDto: RegisterUserDto = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('2000-01-01'),
      };
      const newUser = new User(
        registerUserDto.username,
        registerUserDto.firstName,
        registerUserDto.lastName,
        registerUserDto.dateOfBirth,
      );
      (repository.isUserExists as jest.Mock).mockResolvedValue(false);
      (repository.insert as jest.Mock).mockResolvedValue(newUser);

      const result = await service.createNewUser(registerUserDto);

      expect(repository.isUserExists).toHaveBeenCalledWith(
        registerUserDto.username,
      );
      expect(repository.insert).toHaveBeenCalledWith(expect.any(User));
      expect(result).toEqual(newUser);
    });

    it('should throw HttpException if username already exists', async () => {
      const registerUserDto: RegisterUserDto = {
        username: 'existinguser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('2000-01-01'),
      };
      (repository.isUserExists as jest.Mock).mockResolvedValue(true);

      await expect(service.createNewUser(registerUserDto)).rejects.toThrowError(
        new HttpException(
          {
            message: 'Username already exists',
            code: ERROR_LIST.USER_USERNAME_EXISTED,
          },
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('revertNewUser', () => {
    it('should revert a new user registration', async () => {
      const revertRegisterUserDto: RevertRegisterUserDto = {
        username: 'testuser',
      };
      const user = new User('testuser', 'Test', 'User', new Date('2000-01-01'));
      (repository.isUserExists as jest.Mock).mockResolvedValue(true);
      (repository.getUserByUsername as jest.Mock).mockResolvedValue(user);
      (repository.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await service.revertNewUser(revertRegisterUserDto);

      expect(repository.isUserExists).toHaveBeenCalledWith(
        revertRegisterUserDto.username,
      );
      expect(repository.getUserByUsername).toHaveBeenCalledWith(
        revertRegisterUserDto.username,
      );
      expect(repository.remove).toHaveBeenCalledWith(user);
      expect(result).toBe(true);
    });

    it('should return false if username does not exist', async () => {
      const revertRegisterUserDto: RevertRegisterUserDto = {
        username: 'nonexistentuser',
      };
      (repository.isUserExists as jest.Mock).mockResolvedValue(false);

      const result = await service.revertNewUser(revertRegisterUserDto);

      expect(repository.isUserExists).toHaveBeenCalledWith(
        revertRegisterUserDto.username,
      );
      expect(result).toBe(false);
    });

    it('should return false if user is not found after checking existence', async () => {
      const revertRegisterUserDto: RevertRegisterUserDto = {
        username: 'testuser',
      };
      (repository.isUserExists as jest.Mock).mockResolvedValue(true);
      (repository.getUserByUsername as jest.Mock).mockResolvedValue(null);

      const result = await service.revertNewUser(revertRegisterUserDto);

      expect(repository.isUserExists).toHaveBeenCalledWith(
        revertRegisterUserDto.username,
      );
      expect(repository.getUserByUsername).toHaveBeenCalledWith(
        revertRegisterUserDto.username,
      );
      expect(result).toBe(false);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'testuser';
      const user = new User(username, 'Test', 'User', new Date('2000-01-01'));
      (repository.getUserByUsername as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserByUsername(username);

      expect(repository.getUserByUsername).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const username = 'nonexistentuser';
      (repository.getUserByUsername as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserByUsername(username)).rejects.toThrowError(
        new NotFoundException({
          message: 'User not found',
          code: ERROR_LIST.USER_USERNAME_NOT_FOUND,
        }),
      );
    });
  });

  describe('getUserByIdHash', () => {
    it('should return a user by idHash', async () => {
      const idHash = 'somehash';
      const user = new User('testuser', 'Test', 'User', new Date('2000-01-01'));
      (repository.getUserByIdHash as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserByIdHash(idHash);

      expect(repository.getUserByIdHash).toHaveBeenCalledWith(idHash);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const idHash = 'nonexistenthash';
      (repository.getUserByIdHash as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserByIdHash(idHash)).rejects.toThrowError(
        new NotFoundException({
          message: 'User not found',
          code: ERROR_LIST.USER_USERNAME_NOT_FOUND,
        }),
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const id = 'someid';
      const user = new User('testuser', 'Test', 'User', new Date('2000-01-01'));
      (repository.getUserById as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserById(id);

      expect(repository.getUserById).toHaveBeenCalledWith(id);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = 'nonexistentid';
      (repository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById(id)).rejects.toThrowError(
        new NotFoundException({
          message: 'User not found',
          code: ERROR_LIST.USER_USERNAME_NOT_FOUND,
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      const idHash = 'somehash';
      const user = new User('testuser', 'Test', 'User', new Date('2000-01-01'));
      (repository.getUserByIdHash as jest.Mock).mockResolvedValue(user);
      (repository.save as jest.Mock).mockResolvedValue({
        ...user,
        deletedAt: new Date(),
      });

      const result = await service.softDelete(idHash);

      expect(repository.getUserByIdHash).toHaveBeenCalledWith(idHash);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const users: User[] = [
        new User('user1', 'User', 'One', new Date('1990-01-01')),
        new User('user2', 'User', 'Two', new Date('1992-02-02')),
      ];
      const totalCount = 2;
      (repository.findAll as jest.Mock).mockResolvedValue([users, totalCount]);

      const result = await service.getUsers(paginationDto);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        data: users,
        totalCount,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        idHash: 'somehash',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: new Date('1985-05-15'),
      };
      const existingUser = new User(
        'testuser',
        'Old',
        'Name',
        new Date('1980-01-01'),
      );
      (repository.getUserByIdHash as jest.Mock).mockResolvedValue(existingUser);
      const updatedUser = {
        ...existingUser,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        dateOfBirth: updateUserDto.dateOfBirth,
      };
      (repository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUser(updateUserDto);

      expect(repository.getUserByIdHash).toHaveBeenCalledWith(
        updateUserDto.idHash,
      );
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          dateOfBirth: updateUserDto.dateOfBirth,
        }),
      );
      expect(result).toEqual(updatedUser);
    });
  });
});

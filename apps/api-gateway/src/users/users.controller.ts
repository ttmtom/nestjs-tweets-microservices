import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import { PaginationDto } from '@libs/contracts/general/dto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegisterResponse } from '../app/response';
import { Roles, User } from '../common/decorators';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto, UpdateUserGatewayDto } from './dto';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject()
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN)
  async getUsers(@Query() paginationDto: PaginationDto) {
    const users = await this.usersService.getUsers(paginationDto);
    return {
      ...users,
      data: users.data.map((user) => ({
        id: user.idHash,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  @Post()
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log('/create called with username: ', createUserDto.username);
    const result = await this.usersService.createUser(createUserDto);
    const response = new RegisterResponse(result.user, result.auth);
    this.logger.log('Create successful: ', response.username, response.id);
    return response;
  }

  @Get(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async getUserById(@Param('id') idHash: string, @User() user: IJwtPayload) {
    this.logger.log(`Getting user with ID ${idHash}`);
    if (idHash !== user.idHash && user.role !== EUserRole.ADMIN) {
      throw new ForbiddenException({
        message: 'Forbidden',
        code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
      });
    }

    const userRes = await this.usersService.getUserByIdHash(idHash);
    return {
      id: userRes.idHash,
      username: userRes.username,
      firstName: userRes.firstName,
      lastName: userRes.lastName,
      dateOfBirth: userRes.dateOfBirth,
      role: userRes.role,
      createdAt: userRes.createdAt,
      updatedAt: userRes.updatedAt,
    };
  }

  @Put(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN, EUserRole.USER)
  async updateUser(
    @Param('id') idHash: string,
    @Body() updateUserDto: UpdateUserGatewayDto,
    @User() user: IJwtPayload,
  ) {
    this.logger.log(`Updating user with ID ${idHash}`);
    if (Object.keys(updateUserDto).length === 0 || !updateUserDto.atLeastOne) {
      throw new BadRequestException({
        message: 'No data provided',
        code: ERROR_LIST.APIGATEWAY_NO_DATA_PROVIDED,
      });
    }

    if (idHash !== user.idHash && user.role !== EUserRole.ADMIN) {
      throw new ForbiddenException({
        message: 'Forbidden',
        code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
      });
    }

    const updateUser = await this.usersService.updateUser(
      updateUserDto,
      idHash,
    );
    return {
      id: updateUser.idHash,
      username: updateUser.username,
      firstName: updateUser.firstName,
      lastName: updateUser.lastName,
      dateOfBirth: updateUser.dateOfBirth,
      createdAt: updateUser.createdAt,
      updatedAt: updateUser.updatedAt,
    };
  }

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    this.logger.log(`Deleting user with ID ${id}`);
    await this.usersService.softDeleteUser(id);
  }
}

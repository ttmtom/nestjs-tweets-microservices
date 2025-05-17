import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import {
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
  UseGuards,
} from '@nestjs/common';
import { RegisterResponse } from '../auth/response';
import { Roles } from '../common/decorators/role.decorator';
import { User } from '../common/decorators/user.decorator';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto';
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
  async getUsers() {
    // @TODO
    throw new Error('Method not implemented.');
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
  updateUser(@Param('id') id: string) {
    // @TODO
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    this.logger.log(`Deleting user with ID ${id}`);
    await this.usersService.softDeleteUser(id);
  }
}

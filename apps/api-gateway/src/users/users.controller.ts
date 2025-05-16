import { EUserRole } from '@libs/contracts/auth/enums';
import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import {
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
import { Roles } from '../common/decorators/role.decorator';
import { User } from '../common/decorators/user.decorator';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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
  createUser() {
    // @TODO
    throw new Error('Method not implemented.');
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

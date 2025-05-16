import { EUserRole } from '@libs/contracts/auth/enums';
import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/role.decorator';
import { ApiGatewayAuthGuard } from '../common/guards/api-gateway-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
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
  getUserById(@Param('id') id: string) {
    // @TODO
    throw new Error('Method not implemented.');
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
    // @TODO
    throw new Error('Method not implemented.');
  }
}

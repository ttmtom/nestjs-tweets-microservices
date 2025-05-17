// src/common/guards/roles.guard.ts
import { EUserRole } from '@libs/contracts/auth/enums';
import { ERROR_LIST } from '@libs/contracts/constants/error-list';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<EUserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const match = requiredRoles.some((role) => user.role === role);
    if (!match) {
      throw new ForbiddenException({
        message: 'Forbidden resource',
        code: ERROR_LIST.APIGATEWAY_FORBIDDEN_ACCESS,
      });
    }
    return true;
  }
}

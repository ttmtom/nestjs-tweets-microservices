import { IJwtPayload } from '@libs/contracts/auth/interfaces';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assumes 'user' is attached by Passport
  },
);

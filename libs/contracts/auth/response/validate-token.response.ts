import { IJwtPayload } from '@libs/contracts/auth/interfaces';

export type TValidateTokenResponse = {
  isValid: boolean;
  user: IJwtPayload;
};

import { PaginatedResultResponse } from '@libs/contracts/general/response';

export type TGetUsersResponse = PaginatedResultResponse<{
  id: string;
  idHash: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}>;

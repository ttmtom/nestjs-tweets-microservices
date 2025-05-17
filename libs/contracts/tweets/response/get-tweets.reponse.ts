import { PaginatedResultResponse } from '@libs/contracts/general/response/paginated-result.response';

export type TGetTweetsResponse = PaginatedResultResponse<{
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

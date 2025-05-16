export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  code?: number;
  errors?: string[] | Record<string, any>;
  timestamp: string;
}

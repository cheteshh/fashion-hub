export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  metadata?: any;
}

export function successResponse<T>(data: T, message?: string, metadata?: any): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    metadata,
  };
}

export function errorResponse(error: string, metadata?: any): ApiResponse<null> {
  return {
    success: false,
    error,
    metadata,
  };
}

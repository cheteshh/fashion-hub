export interface AppResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
export interface Response<T> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: string;
    email: string;
    role: 'admin' | 'student';
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
}
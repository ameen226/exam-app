export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: string;
    email: string;
    role: 'admin' | 'student';
    errors: string[];
}
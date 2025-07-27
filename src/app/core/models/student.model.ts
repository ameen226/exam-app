export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;   
}

export interface StudentRegistrationRequest {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    email: string;
}

export interface StudentRegistrationResponse {
    success: boolean;
    id: string;
    token: string;
    email: string;
    role: string;
    message: string;
    errors: string[]
}
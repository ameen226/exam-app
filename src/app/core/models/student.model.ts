export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
}

export interface UpdateStudentStatusDto {
  enabled: boolean;
}

export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StudentToggleRequest {
    studentId: string;
    isEnabled: boolean;
}

export interface StudentToggleResponse {
    success: boolean;
    message: string;
    student: Student;
}

export interface StudentsFilter {
  pageNumber: number;
  pageSize: number;
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
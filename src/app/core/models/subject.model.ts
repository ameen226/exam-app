export interface SubjectDto {
  id: number;
  name: string;
}

export interface AssignSubjectDto {
  subjectId: number;
}

export interface Response<T> {
  success: boolean;
  message: string;
  errors: string[];
  data?: T;
}

export interface SubjectCardData extends SubjectDto {
  enrolled: boolean;
  selected: boolean;
}


export interface ValidationResult {
  valid: boolean;
  message: string;
}


export interface CreateSubjectDto {
  name: string;
}

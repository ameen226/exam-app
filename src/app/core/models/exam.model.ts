export interface ExamRecordDto {
  id: number;
  studentName: string;
  studentEmail: string;
  subjectName: string;
  startedAt: Date;
  submitedAt: Date;
  score: number;
}

export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  totalCount: number;
  items: T[];
  pageNumber: number;
  pageSize: number;
}

export interface ExamHistoryResponse {
  success: boolean;
  message?: string;
  data: PagedResult<ExamRecordDto>;
}
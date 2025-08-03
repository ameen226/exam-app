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


export interface AnswerDto {
  id: number;
  text: string;
}

export interface ExamQuestionDto {
  id: number;
  questionId: number;
  text: string;
  answers: AnswerDto[];
}

export interface ExamDto {
  id: number;
  subjectName: string;
  examQuestions: ExamQuestionDto[];
  startedAt: string;
  duration: string; // TimeSpan format "HH:mm:ss"
}

export interface CreateExamDto {
  subjectId: number;
}

export interface SubmitExamQuestionDto {
  id: number;
  questionId: number;
  selectedAnswerId: number;
}

export interface SubmitExamDto {
  id: number;
  examQeustions: SubmitExamQuestionDto[];
}

export interface SubjectDto {
  id: number;
  name: string;
}

// Local interfaces for component state
export interface ExamState {
  currentQuestionIndex: number;
  userAnswers: { [questionIndex: number]: number };
  timeLeft: number;
  examStartTime: Date;
  isSubmitted: boolean;
}

export interface QuestionNavItem {
  index: number;
  number: string;
  isAnswered: boolean;
  isCurrent: boolean;
}

export interface ExamSummary {
  subjectName: string;
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  timeSpent: string;
  timeRemaining: string;
}
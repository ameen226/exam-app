export interface CreateExamConfigurationDto {
  duration: string; // TimeSpan format "HH:mm:ss"
  numberOfQuestions: number;
}

export interface SubjectDto {
  id: number;
  name: string;
}

// Local interfaces for component state
export interface ExamConfigurationForm {
  subjectId: number | null;
  hours: number;
  minutes: number;
  seconds: number;
  numberOfQuestions: number;
}

export interface ExamConfigurationPreview {
  subject: string;
  duration: string;
  numberOfQuestions: number;
  timePerQuestion: string;
}

export interface TimeValidation {
  isValid: boolean;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: string[];
}


// Recommended durations
export const DURATION_RECOMMENDATIONS = {
  short: { hours: 0, minutes: 30, seconds: 0, description: 'Short assessments' },
  standard: { hours: 1, minutes: 30, seconds: 0, description: 'Standard exams' },
  comprehensive: { hours: 2, minutes: 0, seconds: 0, description: 'Comprehensive evaluations' },
  final: { hours: 3, minutes: 0, seconds: 0, description: 'Final exams' }
};

// Question count recommendations
export const QUESTION_RECOMMENDATIONS = {
  quick: { count: 15, description: 'Quick assessments' },
  standard: { count: 30, description: 'Standard exams' },
  comprehensive: { count: 50, description: 'Comprehensive evaluations' }
};

// utils/exam.utils.ts

import { ExamDto, ExamQuestionDto, QuestionNavItem, ExamSummary } from '../models/exam.model';

/**
 * Utility functions for exam-related operations
 */
export class ExamUtils {
  
  /**
   * Parse TimeSpan duration string to seconds
   * @param duration - Duration in format "HH:mm:ss"
   * @returns Duration in seconds
   */
  static parseDurationToSeconds(duration: string): number {
    const timeParts = duration.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const seconds = parseInt(timeParts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  /**
   * Calculate remaining time for an exam
   * @param exam - Exam data
   * @returns Remaining time in seconds
   */
  static calculateRemainingTime(exam: ExamDto): number {
    const totalDurationSeconds = this.parseDurationToSeconds(exam.duration);
    const startTime = new Date(exam.startedAt);
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    
    return Math.max(0, totalDurationSeconds - elapsedSeconds);
  }

  /**
   * Format seconds to MM:SS or HH:MM:SS format
   * @param seconds - Time in seconds
   * @param includeHours - Whether to include hours
   * @returns Formatted time string
   */
  static formatTime(seconds: number, includeHours: boolean = false): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (includeHours || hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get choice letter for answer index
   * @param index - Answer index (0-based)
   * @returns Choice letter (A, B, C, D, etc.)
   */
  static getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Calculate exam progress percentage
   * @param currentQuestionIndex - Current question index (0-based)
   * @param totalQuestions - Total number of questions
   * @returns Progress percentage (0-100)
   */
  static calculateProgress(currentQuestionIndex: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  }

  /**
   * Count answered questions
   * @param userAnswers - User answers object
   * @returns Number of answered questions
   */
  static countAnsweredQuestions(userAnswers: { [questionIndex: number]: number }): number {
    return Object.keys(userAnswers).filter(key => userAnswers[parseInt(key)] !== undefined).length;
  }

  /**
   * Validate exam answers before submission
   * @param exam - Exam data
   * @param userAnswers - User answers
   * @returns Validation result
   */
  static validateExamAnswers(exam: ExamDto, userAnswers: { [questionIndex: number]: number }): {
    isValid: boolean;
    answeredCount: number;
    unansweredCount: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const totalQuestions = exam.examQuestions.length;
    const answeredCount = this.countAnsweredQuestions(userAnswers);
    const unansweredCount = totalQuestions - answeredCount;

    if (unansweredCount > 0) {
      warnings.push(`${unansweredCount} question(s) remain unanswered. These will be marked as incorrect.`);
    }

    if (answeredCount === 0) {
      warnings.push('No questions have been answered. Are you sure you want to submit?');
    }

    return {
      isValid: true, // We allow submission even with unanswered questions
      answeredCount,
      unansweredCount,
      warnings
    };
  }

  /**
   * Generate exam summary for review
   * @param exam - Exam data
   * @param userAnswers - User answers
   * @param timeSpent - Time spent on exam in seconds
   * @returns Exam summary
   */
  static generateExamSummary(
    exam: ExamDto, 
    userAnswers: { [questionIndex: number]: number }, 
    timeSpent: number
  ): ExamSummary {
    const totalQuestions = exam.examQuestions.length;
    const answeredCount = this.countAnsweredQuestions(userAnswers);
    const remainingTime = this.calculateRemainingTime(exam);

    return {
      subjectName: exam.subjectName,
      totalQuestions,
      answeredQuestions: answeredCount,
      unansweredQuestions: totalQuestions - answeredCount,
      timeSpent: this.formatTime(timeSpent, true),
      timeRemaining: this.formatTime(remainingTime, true)
    };
  }

  /**
   * Check if exam is about to expire (within warning threshold)
   * @param timeLeft - Time left in seconds
   * @param warningThreshold - Warning threshold in seconds (default: 5 minutes)
   * @returns Whether exam is about to expire
   */
  static isExamAboutToExpire(timeLeft: number, warningThreshold: number = 300): boolean {
    return timeLeft <= warningThreshold && timeLeft > 0;
  }

  /**
   * Generate question navigation map
   * @param exam - Exam data
   * @param userAnswers - User answers
   * @param currentQuestionIndex - Current question index
   * @returns Question navigation map
   */
  static generateQuestionNavMap(
    exam: ExamDto, 
    userAnswers: { [questionIndex: number]: number }, 
    currentQuestionIndex: number
  ): QuestionNavItem[] {
    return exam.examQuestions.map((_, index) => ({
      index,
      number: (index + 1).toString(),
      isAnswered: userAnswers[index] !== undefined,
      isCurrent: index === currentQuestionIndex
    }));
  }

  /**
   * Check if exam has expired
   * @param exam - Exam data
   * @returns Whether exam has expired
   */
  static hasExamExpired(exam: ExamDto): boolean {
    return this.calculateRemainingTime(exam) <= 0;
  }

  /**
   * Convert user answers to submit format
   * @param exam - Exam data
   * @param userAnswers - User answers from component
   * @returns Submit exam DTO
   */
  static convertToSubmitFormat(exam: ExamDto, userAnswers: { [questionIndex: number]: number }): {
    id: number;
    examQeustions: Array<{
      id: number;
      questionId: number;
      selectedAnswerId: number;
    }>;
  } {
    const examQuestions = exam.examQuestions.map((examQuestion, index) => ({
      id: examQuestion.id,
      questionId: examQuestion.questionId,
      selectedAnswerId: userAnswers[index] || 0 // Default to 0 if no answer selected
    }));

    return {
      id: exam.id,
      examQeustions: examQuestions
    };
  }

  /**
   * Debounce function for reducing API calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Setup page leave warning
   */
  static setupPageLeaveWarning(): () => void {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
      return 'You have an exam in progress. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handler);

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }
}
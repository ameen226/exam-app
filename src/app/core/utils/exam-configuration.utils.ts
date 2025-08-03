import { CreateExamConfigurationDto, ExamConfigurationForm, ExamConfigurationPreview, FormValidation, TimeValidation } from "../models/exam-configuration.model";

/**
 * Utility functions for exam configuration operations
 */
export class ExamConfigurationUtils {

  /**
   * Convert form values to TimeSpan format
   * @param hours - Hours
   * @param minutes - Minutes  
   * @param seconds - Seconds
   * @returns Duration in "HH:mm:ss" format
   */
  static formatDuration(hours: number, minutes: number, seconds: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Parse duration string to individual components
   * @param duration - Duration in "HH:mm:ss" format
   * @returns Object with hours, minutes, seconds
   */
  static parseDuration(duration: string): { hours: number; minutes: number; seconds: number } {
    const parts = duration.split(':');
    return {
      hours: parseInt(parts[0]) || 0,
      minutes: parseInt(parts[1]) || 0,
      seconds: parseInt(parts[2]) || 0
    };
  }

  /**
   * Convert duration to total seconds
   * @param hours - Hours
   * @param minutes - Minutes
   * @param seconds - Seconds
   * @returns Total seconds
   */
  static toTotalSeconds(hours: number, minutes: number, seconds: number): number {
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  /**
   * Convert total seconds to duration components
   * @param totalSeconds - Total seconds
   * @returns Object with hours, minutes, seconds
   */
  static fromTotalSeconds(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { hours, minutes, seconds };
  }

  /**
   * Calculate time per question
   * @param totalSeconds - Total exam duration in seconds
   * @param numberOfQuestions - Number of questions
   * @returns Time per question in minutes (formatted string)
   */
  static calculateTimePerQuestion(totalSeconds: number, numberOfQuestions: number): string {
    if (numberOfQuestions <= 0 || totalSeconds <= 0) {
      return 'N/A';
    }

    const timePerQuestionSeconds = totalSeconds / numberOfQuestions;
    const timePerQuestionMinutes = (timePerQuestionSeconds / 60).toFixed(1);
    return `${timePerQuestionMinutes} minutes`;
  }

  /**
   * Validate time duration
   * @param hours - Hours
   * @param minutes - Minutes
   * @param seconds - Seconds
   * @returns Validation result
   */
  static validateTime(hours: number, minutes: number, seconds: number): TimeValidation {
    const totalSeconds = this.toTotalSeconds(hours, minutes, seconds);

    if (totalSeconds <= 0) {
      return {
        isValid: false,
        message: 'Duration must be greater than 0'
      };
    }

    if (totalSeconds < 300) { // Less than 5 minutes
      return {
        isValid: false,
        message: 'Duration should be at least 5 minutes'
      };
    }

    if (totalSeconds > 18000) { // More than 5 hours
      return {
        isValid: false,
        message: 'Duration should not exceed 5 hours'
      };
    }

    if (minutes >= 60) {
      return {
        isValid: false,
        message: 'Minutes should be less than 60'
      };
    }

    if (seconds >= 60) {
      return {
        isValid: false,
        message: 'Seconds should be less than 60'
      };
    }

    return {
      isValid: true,
      message: 'Valid duration'
    };
  }

  /**
   * Validate number of questions
   * @param numberOfQuestions - Number of questions
   * @returns Validation result
   */
  static validateQuestions(numberOfQuestions: number): TimeValidation {
    if (numberOfQuestions <= 0) {
      return {
        isValid: false,
        message: 'Number of questions must be greater than 0'
      };
    }

    if (numberOfQuestions > 200) {
      return {
        isValid: false,
        message: 'Number of questions should not exceed 200'
      };
    }

    return {
      isValid: true,
      message: 'Valid number of questions'
    };
  }

  /**
   * Validate complete form
   * @param form - Form data
   * @returns Complete validation result
   */
  static validateForm(form: ExamConfigurationForm): FormValidation {
    const errors: string[] = [];

    // Validate time
    const timeValidation = this.validateTime(form.hours, form.minutes, form.seconds);
    if (!timeValidation.isValid) {
      errors.push(timeValidation.message);
    }

    // Validate questions
    const questionsValidation = this.validateQuestions(form.numberOfQuestions);
    if (!questionsValidation.isValid) {
      errors.push(questionsValidation.message);
    }

    // Additional business logic validations
    const totalSeconds = this.toTotalSeconds(form.hours, form.minutes, form.seconds);
    const timePerQuestionSeconds = totalSeconds / form.numberOfQuestions;
    
    if (timePerQuestionSeconds < 30) { // Less than 30 seconds per question
      errors.push('Time per question is too short (less than 30 seconds)');
    }

    if (timePerQuestionSeconds > 600) { // More than 10 minutes per question
      errors.push('Time per question is too long (more than 10 minutes)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate preview data
   * @param form - Form data
   * @param subjects - Available subjects
   * @returns Preview data
   */
  static generatePreview(
    form: ExamConfigurationForm, 
    subjects: { id: number; name: string }[]
  ): ExamConfigurationPreview {
    const sub = subjects.find(s => s.id === Number(form.subjectId));
    console.log(subjects);
    console.log(form.subjectId);
    console.log(sub);
    const totalSeconds = this.toTotalSeconds(form.hours, form.minutes, form.seconds);
    
    return {
      subject: sub ? sub.name : 'Not selected',
      duration: this.formatDuration(form.hours, form.minutes, form.seconds),
      numberOfQuestions: form.numberOfQuestions,
      timePerQuestion: this.calculateTimePerQuestion(totalSeconds, form.numberOfQuestions)
    };
  }

  /**
   * Convert form to DTO
   * @param form - Form data
   * @returns CreateExamConfigurationDto
   */
  static formToDto(form: ExamConfigurationForm): CreateExamConfigurationDto {
    return {
      duration: this.formatDuration(form.hours, form.minutes, form.seconds),
      numberOfQuestions: form.numberOfQuestions
    };
  }

  /**
   * Convert DTO to form
   * @param dto - DTO data
   * @returns Form data (partial, without subjectId)
   */
  static dtoToForm(dto: CreateExamConfigurationDto): Partial<ExamConfigurationForm> {
    const { hours, minutes, seconds } = this.parseDuration(dto.duration);
    
    return {
      hours,
      minutes,
      seconds,
      numberOfQuestions: dto.numberOfQuestions
    };
  }

  /**
   * Get duration recommendation based on number of questions
   * @param numberOfQuestions - Number of questions
   * @returns Recommended duration in seconds
   */
  static getRecommendedDuration(numberOfQuestions: number): { hours: number; minutes: number; seconds: number } {
    // Assume 2-3 minutes per question on average
    const recommendedSeconds = numberOfQuestions * 150; // 2.5 minutes per question
    return this.fromTotalSeconds(recommendedSeconds);
  }

  /**
   * Get question recommendation based on duration
   * @param hours - Hours
   * @param minutes - Minutes
   * @param seconds - Seconds
   * @returns Recommended number of questions
   */
  static getRecommendedQuestions(hours: number, minutes: number, seconds: number): number {
    const totalSeconds = this.toTotalSeconds(hours, minutes, seconds);
    // Assume 2-3 minutes per question
    return Math.floor(totalSeconds / 150); // 2.5 minutes per question
  }

  /**
   * Format duration for display
   * @param duration - Duration string
   * @returns Human readable duration
   */
  static formatDurationForDisplay(duration: string): string {
    const { hours, minutes, seconds } = this.parseDuration(duration);
    const parts = [];
    
    if (hours > 0) {
      parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
      parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : '0 seconds';
  }

  /**
   * Check if configuration is reasonable
   * @param form - Form data
   * @returns Array of warnings
   */
  static getConfigurationWarnings(form: ExamConfigurationForm): string[] {
    const warnings: string[] = [];
    const totalSeconds = this.toTotalSeconds(form.hours, form.minutes, form.seconds);
    const timePerQuestionSeconds = totalSeconds / form.numberOfQuestions;
    
    if (timePerQuestionSeconds < 60) {
      warnings.push('Very short time per question - students may feel rushed');
    }
    
    if (timePerQuestionSeconds > 300) {
      warnings.push('Very long time per question - exam may feel too easy');
    }
    
    if (totalSeconds > 10800) { // More than 3 hours
      warnings.push('Very long exam duration - consider student fatigue');
    }
    
    if (form.numberOfQuestions > 100) {
      warnings.push('Large number of questions - ensure adequate time');
    }
    
    return warnings;
  }
}
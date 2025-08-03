import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { CreateExamConfigurationDto, ExamConfigurationForm, ExamConfigurationPreview, FormValidation, SubjectDto } from "../../../core/models/exam-configuration.model";
import { ExamConfigurationService } from "../../../core/services/exam-configuration.service";
import { ExamConfigurationUtils } from "../../../core/utils/exam-configuration.utils";

@Component({
  selector: 'app-exam-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-configuration.component.html',
  styleUrls: ['./exam-configuration.component.scss']
})
export class ExamConfigurationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component State
  isLoading = false;
  loadingMessage = 'Loading...';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  // Form Data
  formData: ExamConfigurationForm = {
    subjectId: null,
    hours: 1,
    minutes: 30,
    seconds: 0,
    numberOfQuestions: 20
  };

  // Data
  subjects: SubjectDto[] = [];
  
  // Computed Properties
  preview: ExamConfigurationPreview = {
    subject: 'Not selected',
    duration: '01:30:00',
    numberOfQuestions: 20,
    timePerQuestion: '4.5 minutes'
  };

  formValidation: FormValidation | null = null;
  validationWarnings: string[] = [];
  recommendedQuestions = 0;

  constructor(private examConfigService: ExamConfigurationService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  private loadSubjects(): void {
    this.isLoading = true;
    this.loadingMessage = 'Loading subjects...';
    this.errorMessage = '';

    // For demo purposes, using static subjects
    // Replace this with actual API call when subjects endpoint is available

    this.examConfigService.getSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.subjects = response.data;
          } else {
            this.errorMessage = response.message || 'Failed to load subjects';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load subjects';
          this.isLoading = false;
        }
      });
    
  }

  // Form Management
  updatePreview(): void {
    this.preview = ExamConfigurationUtils.generatePreview(this.formData, this.subjects);
    this.formValidation = ExamConfigurationUtils.validateForm(this.formData);
    this.validationWarnings = ExamConfigurationUtils.getConfigurationWarnings(this.formData);
    this.recommendedQuestions = ExamConfigurationUtils.getRecommendedQuestions(
      this.formData.hours, 
      this.formData.minutes, 
      this.formData.seconds
    );
  }

  // Duration Presets
  setDurationPreset(hours: number, minutes: number, seconds: number): void {
    this.formData.hours = hours;
    this.formData.minutes = minutes;
    this.formData.seconds = seconds;
    this.updatePreview();
  }

  // Question Presets
  setQuestionPreset(numberOfQuestions: number): void {
    this.formData.numberOfQuestions = numberOfQuestions;
    this.updatePreview();
  }

  applyRecommendedQuestions(): void {
    if (this.recommendedQuestions > 0) {
      this.formData.numberOfQuestions = this.recommendedQuestions;
      this.updatePreview();
    }
  }

  // Form Actions
  resetForm(): void {
      this.formData = {
        subjectId: null,
        hours: 1,
        minutes: 30,
        seconds: 0,
        numberOfQuestions: 20
      };
      this.clearMessages();
      this.updatePreview();
  }

  onSubmit(): void {
    if (!this.formValidation?.isValid) {
      this.errorMessage = 'Please fix the validation errors before submitting.';
      return;
    }

    if (!this.formData.subjectId) {
      this.errorMessage = 'Please select a subject.';
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const configDto: CreateExamConfigurationDto = ExamConfigurationUtils.formToDto(this.formData);

    this.examConfigService.createExamConfiguration(this.formData.subjectId, configDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = `Exam configuration saved successfully for ${this.preview.subject}!`;
            this.scrollToTop();
            setTimeout(() => {
                this.resetForm();
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to save exam configuration.';
            this.scrollToTop();
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to save exam configuration.';
          this.isSubmitting = false;
          this.scrollToTop();
        }
      });
  }

  // Message Management
  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Utility Methods
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Template Helper Methods
  getSubjectName(subjectId: number): string {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  }

  isDurationValid(): boolean {
    const timeValidation = ExamConfigurationUtils.validateTime(
      this.formData.hours, 
      this.formData.minutes, 
      this.formData.seconds
    );
    return timeValidation.isValid;
  }

  isQuestionsValid(): boolean {
    const questionsValidation = ExamConfigurationUtils.validateQuestions(this.formData.numberOfQuestions);
    return questionsValidation.isValid;
  }

  getTotalSeconds(): number {
    return ExamConfigurationUtils.toTotalSeconds(
      this.formData.hours, 
      this.formData.minutes, 
      this.formData.seconds
    );
  }

  getFormattedDuration(): string {
    return ExamConfigurationUtils.formatDuration(
      this.formData.hours, 
      this.formData.minutes, 
      this.formData.seconds
    );
  }

  getTimePerQuestionInSeconds(): number {
    const totalSeconds = this.getTotalSeconds();
    return totalSeconds / this.formData.numberOfQuestions;
  }

}
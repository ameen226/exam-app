// exam.component.ts

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';


import {
  ExamDto,
  ExamQuestionDto,
  SubjectDto,
  CreateExamDto,
  SubmitExamDto,
  ExamState,
  QuestionNavItem,
  ExamSummary
} from '../../../core/models/exam.model';
import { CanComponentDeactivate } from '../../../core/guards/exam.guard';
import { ExamService } from '../../../core/services/exam.service';
import { ExamUtils } from '../../../core/utils/exam.util';

type ViewState = 'subject-selection' | 'exam' | 'results';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  // View State
  currentView: ViewState = 'subject-selection';
  isLoading = false;
  loadingMessage = 'Loading...';
  errorMessage = '';

  // Subject Selection
  subjects: SubjectDto[] = [];
  selectedSubjectId: number | null = null;

  // Exam Data
  currentExam: ExamDto | null = null;
  currentQuestionIndex = 0;
  userAnswers: { [questionIndex: number]: number } = {};
  
  // Timer
  timeLeft = 0;
  formattedTimeLeft = '00:00';
  isTimeWarning = false;
  private timerSubscription?: Subscription;
  private examStartTime?: Date;
  private removePageLeaveWarning?: () => void;

  // Submission
  showSubmitModal = false;
  isSubmitting = false;
  submittedExamSubject = '';
  validationResult?: {
    isValid: boolean;
    answeredCount: number;
    unansweredCount: number;
    warnings: string[];
  };
  examSummary?: ExamSummary;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.currentView === 'exam' && this.currentExam) {
      $event.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
    }
  }

  canDeactivate(): boolean {
    if (this.currentView === 'exam' && this.currentExam) {
      return confirm('You have an exam in progress. Are you sure you want to leave?');
    }
    return true;
  }

  // Getters
  get currentQuestion(): ExamQuestionDto | undefined {
    return this.currentExam?.examQuestions[this.currentQuestionIndex];
  }

  get progressPercentage(): number {
    if (!this.currentExam) return 0;
    return ExamUtils.calculateProgress(this.currentQuestionIndex, this.currentExam.examQuestions.length);
  }

  get questionNavMap(): QuestionNavItem[] {
    if (!this.currentExam) return [];
    return ExamUtils.generateQuestionNavMap(this.currentExam, this.userAnswers, this.currentQuestionIndex);
  }

  // Subject Management
  private loadSubjects(): void {
    this.isLoading = true;
    this.loadingMessage = 'Loading subjects...';
    this.errorMessage = '';

    // For demo purposes, using static subjects
    // Replace this with actual API call when subjects endpoint is available
    this.subjects = [];
    
    this.isLoading = false;

    this.examService.getSubjects().subscribe({
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

  startExam(): void {
    if (!this.selectedSubjectId) {
      this.errorMessage = 'Please select a subject';
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Starting exam...';
    this.errorMessage = '';

    const createExamDto: CreateExamDto = {
      subjectId: this.selectedSubjectId
    };

    this.examService.requestExam(createExamDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentExam = response.data;
          this.currentQuestionIndex = 0;
          this.userAnswers = {};
          this.examStartTime = new Date();
          this.currentView = 'exam';
          this.setupExam();
        } else {
          this.errorMessage = response.errors?.[0] || 'Failed to start exam';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to start exam';
        this.isLoading = false;
      }
    });
  }

  private setupExam(): void {
    if (!this.currentExam) return;

    // Calculate initial time left
    this.timeLeft = ExamUtils.calculateRemainingTime(this.currentExam);
    this.updateTimerDisplay();

    // Setup timer
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.timeLeft > 0 && this.currentView === 'exam'))
      .subscribe(() => {
        this.timeLeft--;
        this.updateTimerDisplay();
        this.checkTimeWarning();

        if (this.timeLeft <= 0) {
          this.autoSubmitExam();
        }
      });

    // Setup page leave warning
    this.removePageLeaveWarning = ExamUtils.setupPageLeaveWarning();
  }

  private updateTimerDisplay(): void {
    this.formattedTimeLeft = ExamUtils.formatTime(this.timeLeft);
  }

  private checkTimeWarning(): void {
    this.isTimeWarning = ExamUtils.isExamAboutToExpire(this.timeLeft);
  }

  // Question Navigation
  selectAnswer(answerId: number): void {
    this.userAnswers[this.currentQuestionIndex] = answerId;
  }

  nextQuestion(): void {
    if (this.currentExam && this.currentQuestionIndex < this.currentExam.examQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    if (this.currentExam && index >= 0 && index < this.currentExam.examQuestions.length) {
      this.currentQuestionIndex = index;
    }
  }

  getChoiceLetter(index: number): string {
    return ExamUtils.getChoiceLetter(index);
  }

  // Submission
  showSubmitConfirmation(): void {
    if (!this.currentExam) return;

    this.validationResult = ExamUtils.validateExamAnswers(this.currentExam, this.userAnswers);
    
    const timeSpent = this.examStartTime 
      ? Math.floor((new Date().getTime() - this.examStartTime.getTime()) / 1000)
      : 0;
    
    this.examSummary = ExamUtils.generateExamSummary(this.currentExam, this.userAnswers, timeSpent);
    this.showSubmitModal = true;
  }

  hideSubmitConfirmation(): void {
    this.showSubmitModal = false;
  }

  submitExam(): void {
    console.log("Submitting exam...");
    if (!this.currentExam || this.isSubmitting) return;

    this.isSubmitting = true;
    const submitData = ExamUtils.convertToSubmitFormat(this.currentExam, this.userAnswers);
    console.log("Exam ID:", this.currentExam.id);
    console.log("Submit data:", submitData);

    this.examService.submitExam(this.currentExam.id, submitData).subscribe({
      next: (response) => {
        if (response.success) {
          this.submittedExamSubject = this.currentExam!.subjectName;
          this.currentView = 'results';
          this.cleanup();
        } else {
          this.errorMessage = response.errors?.[0] || 'Failed to submit exam';
        }
        this.isSubmitting = false;
        this.showSubmitModal = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to submit exam';
        this.isSubmitting = false;
        this.showSubmitModal = false;
      }
    });
  }

  private autoSubmitExam(): void {
    if (!this.currentExam) return;

    console.log('Time expired - auto submitting exam');
    this.submitExam();
  }

  // Utility Methods
  resetExam(): void {
    this.cleanup();
    this.currentView = 'subject-selection';
    this.currentExam = null;
    this.selectedSubjectId = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.errorMessage = '';
    this.submittedExamSubject = '';
    this.showSubmitModal = false;
    this.isSubmitting = false;
    this.validationResult = undefined;
    this.examSummary = undefined;
  }

  private cleanup(): void {
    // Stop timer
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    // Remove page leave warning
    if (this.removePageLeaveWarning) {
      this.removePageLeaveWarning();
      this.removePageLeaveWarning = undefined;
    }
  }
}
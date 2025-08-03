import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QuestionService } from '../../../core/services/question.service';
import {
  CreateQuestionDto,
  Difficulty,
  Subject,
} from '../../../core/models/question.model';
import { Subject as RxjsSubject, takeUntil } from 'rxjs';
import {Response} from '../../../core/models/Response.model';

@Component({
  selector: 'app-create-exam-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-exam-question.component.html',
  styleUrls: ['./create-exam-question.component.scss'],
})
export class CreateExamQuestionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private questionService = inject(QuestionService);
  private destroy$ = new RxjsSubject<void>();

  // Expose enum to template
  Difficulty = Difficulty;

  questionForm!: FormGroup;
  subjects: Subject[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  correctAnswerError = false;

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.questionForm = this.fb.group({
      subjectId: ['', Validators.required],
      text: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['', Validators.required],
      correctAnswerIndex: [null, Validators.required], // new field
      answers: this.fb.array([
        this.createAnswerGroup(),
        this.createAnswerGroup(),
        this.createAnswerGroup(),
        this.createAnswerGroup(),
      ]),
    });
  }

  private loadSubjects(): void {
    this.questionService
      .getSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subjects) => {
          this.subjects = subjects;
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.errorMessage = 'Failed to load subjects';
        },
      });
  }

  get answersArray(): FormArray {
    return this.questionForm.get('answers') as FormArray;
  }

  createAnswerGroup(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  onSubmit(): void {
    // Clear previous messages
    this.clearMessages();

    if (this.questionForm.invalid) {
      this.markFormGroupTouched(this.questionForm);
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    // Check if a correct answer is selected
    const correctAnswerIndex = this.questionForm.get('correctAnswerIndex')?.value;

    if (correctAnswerIndex === -1) {
      this.correctAnswerError = true;
      this.errorMessage = 'Please select the correct answer';
      return;
    }

    // Check if all answers are unique
    const answerTexts = this.answersArray.controls.map((control) =>
      control.get('text')?.value?.trim().toLowerCase()
    );
    const uniqueAnswers = new Set(answerTexts);

    if (uniqueAnswers.size !== answerTexts.length) {
      this.errorMessage = 'All answer options must be unique';
      return;
    }

    this.submitQuestion(correctAnswerIndex);
  }

  private submitQuestion(correctAnswerIndex: number): void {
    this.isSubmitting = true;

    const formValue = this.questionForm.value;

    const createQuestionDto: CreateQuestionDto = {
      text: formValue.text.trim(),
      difficulty: parseInt(formValue.difficulty),
      correctAnswerIndex: correctAnswerIndex,
      subjectId: parseInt(formValue.subjectId),
      answersList: formValue.answers.map((answer: any) => ({
        text: answer.text.trim(),
      })),
    };

    this.questionService
      .createQuestion(createQuestionDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Response<any>) => {
          this.handleSubmissionResponse(response);
        },
        error: (error) => {
          this.handleSubmissionError(error);
        },
      });
  }

  private handleSubmissionResponse(response: Response<any>): void {
    this.isSubmitting = false;

    if (response.success) {
      this.successMessage = response.message || 'Question added successfully!';
      this.resetForm();

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } else {
      this.errorMessage = response.errors?.[0] || 'Failed to add question';
    }
  }

  private handleSubmissionError(error: any): void {
    this.isSubmitting = false;
    console.error('Error creating question:', error);

    if (error.status === 401) {
      this.errorMessage = 'You are not authorized to perform this action';
    } else if (error.status === 400) {
      this.errorMessage = error.error || 'Invalid data provided';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.questionForm.reset();

    // Reset answers array to 4 empty options
    while (this.answersArray.length !== 0) {
      this.answersArray.removeAt(0);
    }

    for (let i = 0; i < 4; i++) {
      this.answersArray.push(this.createAnswerGroup());
    }

    this.correctAnswerError = false;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.correctAnswerError = false;
  }

  // Public method to programmatically add more answer options if needed
  addAnswerOption(): void {
    if (this.answersArray.length < 6) {
      // Limit to 6 options max
      this.answersArray.push(this.createAnswerGroup());
    }
  }

  // Public method to remove answer option if needed
  removeAnswerOption(index: number): void {
    if (this.answersArray.length > 2) {
      // Minimum 2 options
      this.answersArray.removeAt(index);
    }
  }

  get correctAnswerControl(): FormControl {
  return this.questionForm.get('correctAnswerIndex') as FormControl;
 }


}

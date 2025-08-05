import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateSubjectService } from '../../../core/services/add-subject.service';
import {
  CreateSubjectDto,
  SubjectDto,
  ValidationResult,
} from '../../../core/models/subject.model';

@Component({
  selector: 'app-create-subject',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.scss'],
})
export class CreateSubjectComponent implements OnInit {
  private createSubjectService = inject(CreateSubjectService);
  private fb = inject(FormBuilder);

  createSubjectForm: FormGroup;
  existingSubjects: SubjectDto[] = [];
  loading = false;
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loadingSubjects = false;

  constructor() {
    this.createSubjectForm = this.fb.group({
      subjectName: new FormControl(
        '', // ✅ No disabled here
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9\s\-_]+$/),
        ]
      ),
    });
  }

  ngOnInit() {
    this.loadExistingSubjects();
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    this.subjectNameControl?.valueChanges.subscribe((value) => {
      if (value && value.trim()) {
        const validation = this.validateSubjectName(value.trim());

        if (!validation.valid) {
          this.subjectNameControl?.setErrors({ customError: validation.message });
        } else if (this.subjectNameControl?.errors?.['customError']) {
          const errors = { ...this.subjectNameControl.errors };
          delete errors['customError'];
          this.subjectNameControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    });
  }

  loadExistingSubjects() {
    this.loadingSubjects = true;
    this.createSubjectService.getAllSubjects().subscribe({
      next: (response) => {
        this.loadingSubjects = false;
        if (response.success) {
          this.existingSubjects = response.data || [];
        } else {
          this.showError('Failed to load existing subjects');
        }
      },
      error: () => {
        this.loadingSubjects = false;
        this.showError('Failed to load existing subjects');
      },
    });
  }

  validateSubjectName(name: string): ValidationResult {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { valid: false, message: 'Subject name is required' };
    }

    if (trimmedName.length < 2) {
      return {
        valid: false,
        message: 'Subject name must be at least 2 characters long',
      };
    }

    if (trimmedName.length > 50) {
      return {
        valid: false,
        message: 'Subject name must be less than 50 characters',
      };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      return {
        valid: false,
        message:
          'Subject name can only contain letters, numbers, spaces, hyphens, and underscores',
      };
    }

    const isDuplicate = this.existingSubjects.some(
      (subject) => subject.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return {
        valid: false,
        message: 'A subject with this name already exists',
      };
    }

    return { valid: true, message: '' };
  }

  onSubmit() {
    if (this.createSubjectForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const subjectName = this.subjectNameControl?.value?.trim();

    if (!subjectName) {
      this.showError('Subject name is required');
      return;
    }

    const validation = this.validateSubjectName(subjectName);
    if (!validation.valid) {
      this.showError(validation.message);
      return;
    }

    this.submitting = true;
    this.subjectNameControl?.disable(); // ✅ Disable properly
    this.clearMessages();

    const createSubjectDto: CreateSubjectDto = {
      name: subjectName,
    };

    this.createSubjectService.createSubject(createSubjectDto).subscribe({
      next: (response) => {
        this.submitting = false;
        this.subjectNameControl?.enable(); // ✅ Re-enable

        if (response.success) {
          this.showSuccess(`Subject "${subjectName}" created successfully!`);
          this.createSubjectForm.reset();
          this.loadExistingSubjects();
        } else {
          const errorMsg = response.errors?.[0] || response.message;
          this.showError(errorMsg || 'Failed to create subject');
        }
      },
      error: () => {
        this.submitting = false;
        this.subjectNameControl?.enable(); // ✅ Re-enable on error
        this.showError('An unexpected error occurred');
      },
    });
  }

  onClear() {
    this.createSubjectForm.reset();
    this.clearMessages();
    this.focusSubjectNameInput();
  }

  private markFormGroupTouched() {
    Object.values(this.createSubjectForm.controls).forEach((control) =>
      control.markAsTouched()
    );
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = null;
    this.autoHideMessage();
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = null;
  }

  private clearMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private autoHideMessage() {
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }

  private focusSubjectNameInput() {
    setTimeout(() => {
      const element = document.getElementById('subjectName');
      element?.focus();
    }, 100);
  }

  dismissError() {
    this.errorMessage = null;
  }

  dismissSuccess() {
    this.successMessage = null;
  }

  get subjectNameControl() {
    return this.createSubjectForm.get('subjectName');
  }

  hasError(field: string, errorType: string): boolean {
    const control = this.createSubjectForm.get(field);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.createSubjectForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Subject name is required';
    if (control.errors['minlength']) return 'Subject name must be at least 2 characters long';
    if (control.errors['maxlength']) return 'Subject name must be less than 50 characters';
    if (control.errors['pattern']) return 'Subject name can only contain letters, numbers, spaces, hyphens, and underscores';
    if (control.errors['customError']) return control.errors['customError'];

    return 'Invalid input';
  }

  trackBySubjectId(index: number, subject: SubjectDto): number {
    return subject.id;
  }
}

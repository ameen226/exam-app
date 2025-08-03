import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CreateSubjectService } from "../../../core/services/add-subject.service";
import { CreateSubjectDto, SubjectDto, ValidationResult } from "../../../core/models/subject.model";

@Component({
  selector: 'app-create-subject',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.scss']
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
      subjectName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s\-_]+$/) // Allow letters, numbers, spaces, hyphens, underscores
      ]]
    });
  }

  ngOnInit() {
    this.loadExistingSubjects();
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    this.createSubjectForm.get('subjectName')?.valueChanges.subscribe(value => {
      if (value && value.trim()) {
        const validation = this.validateSubjectName(value.trim());
        const control = this.createSubjectForm.get('subjectName');
        
        if (!validation.valid) {
          control?.setErrors({ customError: validation.message });
        } else if (control?.errors?.['customError']) {
          // Remove custom error if validation passes
          const errors = { ...control.errors };
          delete errors['customError'];
          control.setErrors(Object.keys(errors).length ? errors : null);
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
      }
    });
  }

  validateSubjectName(name: string): ValidationResult {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { valid: false, message: 'Subject name is required' };
    }
    
    if (trimmedName.length < 2) {
      return { valid: false, message: 'Subject name must be at least 2 characters long' };
    }
    
    if (trimmedName.length > 50) {
      return { valid: false, message: 'Subject name must be less than 50 characters' };
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      return { valid: false, message: 'Subject name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    
    // Check for duplicate names (case-insensitive)
    const isDuplicate = this.existingSubjects.some(subject => 
      subject.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'A subject with this name already exists' };
    }
    
    return { valid: true, message: '' };
  }

  onSubmit() {
    if (this.createSubjectForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const subjectName = this.createSubjectForm.get('subjectName')?.value?.trim();
    
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
    this.clearMessages();

    const createSubjectDto: CreateSubjectDto = {
      name: subjectName
    };

    this.createSubjectService.createSubject(createSubjectDto).subscribe({
      next: (response) => {
        this.submitting = false;
        
        if (response.success) {
          this.showSuccess(`Subject "${subjectName}" created successfully!`);
          this.createSubjectForm.reset();
          this.loadExistingSubjects(); // Refresh the list
        } else {
          const errorMsg = response.errors?.length ? response.errors[0] : response.message;
          this.showError(errorMsg || 'Failed to create subject');
        }
      },
      error: () => {
        this.submitting = false;
        this.showError('An unexpected error occurred');
      }
    });
  }

  onClear() {
    this.createSubjectForm.reset();
    this.clearMessages();
    this.focusSubjectNameInput();
  }

  private markFormGroupTouched() {
    Object.keys(this.createSubjectForm.controls).forEach(key => {
      const control = this.createSubjectForm.get(key);
      control?.markAsTouched();
    });
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

  // Getter for template convenience
  get subjectNameControl() {
    return this.createSubjectForm.get('subjectName');
  }

  // Check if field has specific error
  hasError(field: string, errorType: string): boolean {
    const control = this.createSubjectForm.get(field);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  // Get error message for field
  getErrorMessage(field: string): string {
    const control = this.createSubjectForm.get(field);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Subject name is required';
    }
    if (control.errors['minlength']) {
      return 'Subject name must be at least 2 characters long';
    }
    if (control.errors['maxlength']) {
      return 'Subject name must be less than 50 characters';
    }
    if (control.errors['pattern']) {
      return 'Subject name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    if (control.errors['customError']) {
      return control.errors['customError'];
    }

    return 'Invalid input';
  }

  // TrackBy function for ngFor performance
  trackBySubjectId(index: number, subject: SubjectDto): number {
    return subject.id;
  }
}
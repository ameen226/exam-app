import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { PasswordValidators } from '../../../core/validators/password.validator';
import { StudentRegistrationRequest } from '../../../core/models/student.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private router = inject(Router);

  registrationForm: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          PasswordValidators.strongPassword(),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: PasswordValidators.passwordsMatch,
    }
  );

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registrationForm.value;
      const registrationData: StudentRegistrationRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        email: formData.email.trim().toLowerCase(),
      };

      this.studentService.registerStudent(registrationData).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
            this.successMessage =
              response.message ||
              'Registration successful! Redirecting to login...';
            this.registrationForm.reset();

            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage =
              response.errors[0] || 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.message || 'Registration failed. Please try again.';
        },
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registrationForm.controls).forEach((key) => {
      this.registrationForm.get(key)?.markAsTouched();
    });
  }
}

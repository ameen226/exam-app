import { inject, Injectable } from '@angular/core';
import {Response} from '../models/Response.model';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateExamConfigurationDto, SubjectDto } from '../models/exam-configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ExamConfigurationService {
  private readonly baseUrl = environment.apiUrl;

  http = inject(HttpClient);

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  /**
   * Get available subjects for configuration
   */
  getSubjects(): Observable<Response<SubjectDto[]>> {
    return this.http.get<Response<SubjectDto[]>>(`${this.baseUrl}/subject`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create exam configuration for a subject
   */
  createExamConfiguration(
    subjectId: number, 
    configDto: CreateExamConfigurationDto
  ): Observable<Response<void>> {
    return this.http.post<Response<void>>(
      `${this.baseUrl}/subject/${subjectId}/exam-configuration`,
      configDto,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get existing exam configuration for a subject
   */
  getExamConfiguration(subjectId: number): Observable<Response<CreateExamConfigurationDto>> {
    return this.http.get<Response<CreateExamConfigurationDto>>(
      `${this.baseUrl}/subject/${subjectId}/exam-configuration`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update exam configuration for a subject
   */
  updateExamConfiguration(
    subjectId: number, 
    configDto: CreateExamConfigurationDto
  ): Observable<Response<void>> {
    return this.http.put<Response<void>>(
      `${this.baseUrl}/subject/${subjectId}/exam-configuration`,
      configDto,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete exam configuration for a subject
   */
  deleteExamConfiguration(subjectId: number): Observable<Response<void>> {
    return this.http.delete<Response<void>>(
      `${this.baseUrl}/subject/${subjectId}/exam-configuration`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 400 && error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.errors && error.error.errors.length > 0) {
          errorMessage = error.error.errors[0];
        }
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access. Please login as admin.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (error.status === 404) {
        errorMessage = 'Subject not found.';
      } else if (error.status === 409) {
        errorMessage = 'Configuration already exists for this subject.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }
    }

    console.error('ExamConfigurationService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
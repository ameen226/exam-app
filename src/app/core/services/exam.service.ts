// services/exam.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateExamDto, ExamDto, SubjectDto, SubmitExamDto } from '../models/exam.model';
import { Response } from '../models/Response.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  /**
   * Get available subjects for exam
   */
  getSubjects(): Observable<Response<SubjectDto[]>> {
    return this.http.get<Response<SubjectDto[]>>(`${this.baseUrl}/student/me/subjects`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Request an exam for a specific subject
   */
  requestExam(createExamDto: CreateExamDto): Observable<Response<ExamDto>> {
    return this.http.post<Response<ExamDto>>(
      `${this.baseUrl}/me/exam/request`,
      createExamDto,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Submit exam answers
   */
  submitExam(examId: number, submitExamDto: SubmitExamDto): Observable<Response<object>> {
    return this.http.post<Response<object>>(
      `${this.baseUrl}/me/exam/${examId}/submit`,
      submitExamDto,
      this.getHttpOptions()
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
        } else if (error.error.errors && error.error.errors.length > 0) {
          errorMessage = error.error.errors[0];
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden. You don\'t have permission.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }
    }

    console.error('ExamService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
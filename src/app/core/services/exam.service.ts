// src/app/core/services/exam.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExamRecordDto, PagedResult, PaginationParameters } from '../models/exam.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getExamHistories(pagination: PaginationParameters): Observable<PagedResult<ExamRecordDto>> {
    let params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    return this.http.get<PagedResult<ExamRecordDto>>(`${this.apiUrl}/admin/exam/history`, { params })
      .pipe(
        map(response => ({
          ...response,
          items: response.items.map(exam => ({
            ...exam,
            startedAt: new Date(exam.startedAt),
            submitedAt: new Date(exam.submitedAt)
          }))
        })),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Exam histories not found';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden - Admin access required';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    }
    
    return throwError(() => ({ message: errorMessage }));
  }
}
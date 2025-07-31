// question.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environment/environment';
import { CreateQuestionDto, Subject, Response } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // Update this to match your API base URL



  createQuestion(dto: CreateQuestionDto): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + '/question', dto).pipe(
      catchError(error => {
        console.error('Error creating question:', error);
        return of({ 
          success: false, 
          message: '', 
          errors: [error.error || error.message || 'Network error'],
          data: null 
        });
      })
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${environment.apiUrl}/subject`);
  }

  // Add other question-related methods here as needed
  // getQuestions(), updateQuestion(), deleteQuestion(), etc.
}
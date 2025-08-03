import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { CreateSubjectDto, Response, SubjectDto } from "../models/subject.model";
import { catchError, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CreateSubjectService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.apiUrl; // Update this!

  private getAuthHeaders(): HttpHeaders {
    // Get JWT token from localStorage, sessionStorage, or your auth service
    const token = localStorage.getItem('authToken'); // Adjust based on your auth implementation
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createSubject(createSubjectDto: CreateSubjectDto): Observable<Response<object>> {
    return this.http.post<Response<object>>(`${this.API_BASE_URL}/subject`, createSubjectDto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating subject:', error);
        
        // Handle different error types
        let errorMessage = 'Failed to create subject';
        let errors: string[] = [];

        if (error.status === 400 && error.error?.errors) {
          // Backend validation errors
          errors = error.error.errors;
          errorMessage = errors[0] || errorMessage;
        } else if (error.status === 401) {
          errors = ['Unauthorized. Please login again.'];
          errorMessage = 'Unauthorized';
        } else if (error.status === 403) {
          errors = ['You do not have permission to create subjects.'];
          errorMessage = 'Access denied';
        } else if (error.error?.message) {
          errors = [error.error.message];
          errorMessage = error.error.message;
        } else {
          errors = [error.message || 'Unknown error occurred'];
        }

        return of({
          success: false,
          message: errorMessage,
          errors: errors
        });
      })
    );
  }

  getAllSubjects(): Observable<Response<SubjectDto[]>> {
    return this.http.get<Response<SubjectDto[]>>(`${this.API_BASE_URL}/subject`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error getting subjects:', error);
        return of({
          success: false,
          message: 'Failed to load subjects',
          errors: [error.message || 'Unknown error'],
          data: []
        });
      })
    );
  }
}
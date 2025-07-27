import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { StudentRegistrationRequest, StudentRegistrationResponse } from "../models/student.model";
import { catchError, Observable, throwError } from "rxjs";

@Injectable ({
    providedIn: 'root'
})

export class StudentService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    registerStudent(studentData : StudentRegistrationRequest): Observable<StudentRegistrationResponse> {
        return this.http.post<StudentRegistrationResponse>(`${this.apiUrl}/student/register`, studentData)
        .pipe(
            catchError(this.handleError)
        );
    }

     private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'Invalid registration data provided';
      } else if (error.status === 409) {
        errorMessage = 'Email already exists';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage, 
      errors: error.error?.errors 
    }));
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { PaginatedResult, PaginationParameters, Student, UpdateStudentStatusDto } from '../models/student.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentManagementService {
  private http = inject(HttpClient);
  
  private apiUrl = environment.apiUrl;
  private studentsSubject = new BehaviorSubject<PaginatedResult<Student> | null>(null);
  
  // Track ongoing toggle operations to prevent double-clicking
  private toggleOperations = new Set<string>();
  
  public students$ = this.studentsSubject.asObservable();

  getAllStudents(pagination: PaginationParameters): Observable<PaginatedResult<Student>> {
    let params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    return this.http.get<PaginatedResult<Student>>(`${this.apiUrl}/student`, { params })
      .pipe(
        tap(response => this.studentsSubject.next(response)),
        catchError(this.handleError)
      );
  }

  updateStudentStatus(studentId: string, enabled: boolean): Observable<string> {
    // ✅ Prevent multiple simultaneous toggles for the same student
    if (this.toggleOperations.has(studentId)) {
      console.log('Toggle blocked - operation already in progress for student:', studentId);
      return throwError(() => ({ message: 'Toggle operation already in progress' }));
    }

    // ✅ Mark this student as being toggled
    this.toggleOperations.add(studentId);
    console.log('Toggle operation started for student:', studentId, 'Current operations:', Array.from(this.toggleOperations));

    const updateDto: UpdateStudentStatusDto = { enabled };
    
    return this.http.put<string>(`${this.apiUrl}/student/${studentId}/status`, updateDto)
      .pipe(
        tap((response) => {
          // ✅ Only update local state after successful API response
          console.log('Toggle API success:', response);
          this.updateLocalStudentStatus(studentId, enabled);
          console.log('Local state updated for student:', studentId, 'to enabled:', enabled);
        }),
        catchError((error) => {
          console.error('Toggle API error:', error);
          return this.handleError(error);
        }),
        finalize(() => {
          // ✅ Always remove from ongoing operations when done
          console.log('Toggle operation completed for student:', studentId);
          this.toggleOperations.delete(studentId);
          console.log('Remaining operations:', Array.from(this.toggleOperations));
        })
      );
  }

  // ✅ Check if a student toggle is in progress
  isToggleInProgress(studentId: string): boolean {
    return this.toggleOperations.has(studentId);
  }

  // ✅ Separate method to update local state
  private updateLocalStudentStatus(studentId: string, enabled: boolean): void {
    const currentData = this.studentsSubject.value;
    if (currentData && currentData.items) {
      const updatedStudents = currentData.items.map(student => 
        student.id === studentId 
          ? { ...student, enabled: enabled }
          : student
      );
      this.studentsSubject.next({
        ...currentData,
        items: updatedStudents
      });
    }
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
        errorMessage = 'Students not found';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    }
    
    return throwError(() => ({ message: errorMessage, errors: error.error?.errors }));
  }
}
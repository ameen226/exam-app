import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, forkJoin, Observable, of } from "rxjs";
import { SubjectDto, Response, AssignSubjectDto } from "../models/subject.model";
import { environment } from "../../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.apiUrl; 

  private getAuthHeaders(): HttpHeaders {
    // Get JWT token from localStorage, sessionStorage, or your auth service
    const token = localStorage.getItem('authToken'); // Adjust based on your auth implementation
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllSubjects(): Observable<Response<SubjectDto[]>> {
    return this.http.get<Response<SubjectDto[]>>(`${this.API_BASE_URL}/subject`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error getting all subjects:', error);
        return of({
          success: false,
          message: 'Failed to load subjects',
          errors: [error.message || 'Unknown error'],
          data: []
        });
      })
    );
  }

  getStudentSubjects(): Observable<Response<SubjectDto[]>> {
    return this.http.get<Response<SubjectDto[]>>(`${this.API_BASE_URL}/student/me/subjects`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error getting student subjects:', error);
        return of({
          success: false,
          message: 'Failed to load enrolled subjects',
          errors: [error.message || 'Unknown error'],
          data: []
        });
      })
    );
  }

  addSubjectToStudent(subjectId: number): Observable<Response<object>> {
    const dto: AssignSubjectDto = { subjectId };
    return this.http.post<Response<object>>(`${this.API_BASE_URL}/student/me/subjects`, dto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error adding subject ${subjectId}:`, error);
        return of({
          success: false,
          message: 'Failed to add subject',
          errors: [error.message || 'Unknown error']
        });
      })
    );
  }

  addMultipleSubjectsToStudent(subjectIds: number[]): Observable<Response<object>[]> {
    const requests = subjectIds.map(id => this.addSubjectToStudent(id));
    return forkJoin(requests);
  }
}

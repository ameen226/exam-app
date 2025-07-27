import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private apiUrl = 'https://localhost:7198/api';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();

    constructor()
    {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user)
        {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
        .pipe( tap(response => {
            const user = {
                id: response.id,
                email: response.email,
                role: response.role
            }

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(user))
            this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
    );
    }

    logout():void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }


    isAuthenticated():boolean {
        return !!localStorage.getItem('token');
    }


    getToken():string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser():User | null {
        return this.currentUserSubject.value;
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }

    isStudent(): boolean {
      const user = this.getCurrentUser();
      return user?.role === 'student';
    }

    private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    }
    
    return throwError(() => ({ message: errorMessage, errors: error.error?.errors }));
  }
}
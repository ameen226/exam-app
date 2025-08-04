import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';
import { environment } from '../../../environment/environment';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();

    constructor()
    {
        this.initializeUserFromStorage();
    }

    private initializeUserFromStorage(): void {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');

        if (token && userString) {
            try {
                const user = JSON.parse(userString);
                // Ensure the user object has the expected structure
                if (user && user.id && user.email && user.role) {
                    // Normalize role to lowercase for consistency
                    user.role = user.role.toLowerCase();
                    console.log('Initializing user from storage:', user);
                    this.currentUserSubject.next(user);
                } else {
                    console.log('Invalid user data in storage, clearing...');
                    this.clearStorage();
                }
            } catch (error) {
                console.error('Error parsing user from storage:', error);
                this.clearStorage();
            }
        }
    }

    private clearStorage(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
        .pipe( tap(response => {
            const user: User = {
                id: response.id,
                email: response.email,
                role: response.role.toLowerCase() as 'admin' | 'student' // Normalize role to lowercase
            }

            console.log('Login successful, storing user:', user);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(user))
            this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
    );
    }

    logout():void {
        this.clearStorage();
        this.router.navigate(['/login']);
    }

    isAuthenticated():boolean {
        const hasToken = !!localStorage.getItem('token');
        const hasUser = !!this.getCurrentUser();
        console.log('Auth check - Token:', hasToken, 'User:', hasUser);
        return hasToken && hasUser;
    }

    getToken():string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser():User | null {
        const user = this.currentUserSubject.value;
        console.log('getCurrentUser called, returning:', user);
        return user;
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        console.log('isAdmin check - User:', user, 'IsAdmin:', isAdmin);
        return isAdmin;
    }

    isStudent(): boolean {
        const user = this.getCurrentUser();
        const isStudent = user?.role?.toLowerCase() === 'student';
        console.log('isStudent check - User:', user, 'IsStudent:', isStudent);
        return isStudent;
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
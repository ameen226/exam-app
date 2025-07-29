import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
    },
    
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent),
        //canActivate: [adminGuard]
    },
    {
        path: 'admin/students',
        loadComponent: () => import('./features/admin/students/students.component').then(c => c.StudentsComponent),
        //canActivate: [adminGuard]
    },
    {
        path: 'admin/exams',
        loadComponent: () => import('./features/admin/exams/exams.component').then(c => c.ExamsComponent), // ← Use loadComponent for consistency
        //canActivate: [adminGuard]
    },
    
  
    { path: '**', redirectTo: '/login' }
];
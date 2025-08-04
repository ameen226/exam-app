import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { studentGuard } from './core/guards/student.guard';

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
        canActivate: [adminGuard]
    },
    {
        path: 'admin/students',
        loadComponent: () => import('./features/admin/students/students.component').then(c => c.StudentsComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin/exams',
        loadComponent: () => import('./features/admin/exams/exams.component').then(c => c.ExamsComponent), // ← Use loadComponent for consistency
        canActivate: [adminGuard]
    },
    {
        path: 'admin/create-question',
        loadComponent: () => import('./features/admin/create-exam-question/create-exam-question.component').then(c => c.CreateExamQuestionComponent), // ← Use loadComponent for consistency
        canActivate: [adminGuard]
    },
    {
        path: 'student/exam-history',
        loadComponent: () => import('./features/student/exam-history/exam-history.component').then(c => c.ExamsHistoryComponent), // ← Use loadComponent for consistency
        canActivate: [studentGuard]
    },
    {
        path: 'student/exam',
        loadComponent: () => import('./features/student/exam/exam.component').then(c => c.ExamComponent), // ← Use loadComponent for consistency
        canActivate: [studentGuard]
    },
    {
        path: 'admin/exam-configuration',
        loadComponent: () => import('./features/admin/exam-configuration/exam-configuration.component').then(c => c.ExamConfigurationComponent), // ← Use loadComponent for consistency
        canActivate: [adminGuard]
    },
    {
        path: 'student/add-subjects',
        loadComponent: () => import('./features/student/add-subjects/add-subjects.component').then(c => c.AddSubjectsComponent), // ← Use loadComponent for consistency
        canActivate: [studentGuard]
    },
    {
        path: 'admin/create-subject',
        loadComponent: () => import('./features/admin/create-subject/create-subject.component').then(c => c.CreateSubjectComponent), // ← Use loadComponent for consistency
        canActivate: [adminGuard]
    },
    

    { path: '**', redirectTo: '/login' }
];
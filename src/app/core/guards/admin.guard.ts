import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Admin Guard - Checking authentication...');
  console.log('Is Authenticated:', authService.isAuthenticated());
  console.log('Is Admin:', authService.isAdmin());
  console.log('Is Student:', authService.isStudent());
  
  if (!authService.isAuthenticated()) {
    console.log('Not authenticated - redirecting to login');
    router.navigate(['/login']);
    return false;
  }
  
  if (authService.isAdmin()) {
    console.log('Admin access granted');
    return true;
  }
  
  if (authService.isStudent()) {
    console.log('Student trying to access admin area - redirecting');
    router.navigate(['/student/exam-history']);
    return false;
  }
  
  console.log('Unknown role - redirecting to login');
  router.navigate(['/login']);
  return false;
};
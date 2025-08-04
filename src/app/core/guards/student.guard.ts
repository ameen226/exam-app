import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const studentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Student Guard - Checking authentication...');
  
  // First check if authenticated
  if (!authService.isAuthenticated()) {
    console.log('Not authenticated - redirecting to login');
    router.navigate(['/login']);
    return false;
  }
  
  console.log('Is Authenticated:', authService.isAuthenticated());
  console.log('Is Admin:', authService.isAdmin());
  console.log('Is Student:', authService.isStudent());
  
  if (authService.isStudent()) {
    console.log('Student access granted');
    return true;
  }
  
  if (authService.isAdmin()) {
    console.log('Admin trying to access student area - redirecting to admin dashboard');
    router.navigate(['/admin/dashboard']);
    return false;
  }
  
  console.log('Unknown role - redirecting to login');
  router.navigate(['/login']);
  return false;
};
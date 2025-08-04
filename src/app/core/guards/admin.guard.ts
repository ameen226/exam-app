import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Admin Guard - Checking authentication...');
  
  // First check if authenticated
  if (!authService.isAuthenticated()) {
    console.log('Not authenticated - redirecting to login');
    router.navigate(['/login']);
    return false;
  }
  
  // Get current user to debug
  const currentUser = authService.getCurrentUser();
  console.log('Current user from service:', currentUser);
  
  // Check localStorage directly as backup
  const userFromStorage = localStorage.getItem('user');
  console.log('User from localStorage:', userFromStorage);
  
  if (userFromStorage) {
    try {
      const parsedUser = JSON.parse(userFromStorage);
      console.log('Parsed user from storage:', parsedUser);
    } catch (e) {
      console.error('Error parsing user from storage:', e);
    }
  }
  
  console.log('Is Authenticated:', authService.isAuthenticated());
  console.log('Is Admin:', authService.isAdmin());
  console.log('Is Student:', authService.isStudent());
  
  if (authService.isAdmin()) {
    console.log('Admin access granted');
    return true;
  }
  
  if (authService.isStudent()) {
    console.log('Student trying to access admin area - redirecting to student area');
    router.navigate(['/student/exam-history']);
    return false;
  }
  
  console.log('Unknown role - redirecting to login');
  router.navigate(['/login']);
  return false;
};
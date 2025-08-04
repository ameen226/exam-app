import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  navItems: NavItem[] = [];

  // Admin navigation items
  private adminNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Students Management', route: '/admin/students', icon: 'fas fa-users' },
    { label: 'Exams Management', route: '/admin/exams', icon: 'fas fa-clipboard-list' },
    { label: 'Create Question', route: '/admin/create-question', icon: 'fas fa-plus-circle' },
    { label: 'Exam Configuration', route: '/admin/exam-configuration', icon: 'fas fa-cogs' },
    { label: 'Create Subject', route: '/admin/create-subject', icon: 'fas fa-book-open' }
  ];

  // Student navigation items
  private studentNavItems: NavItem[] = [
    { label: 'Exam History', route: '/student/exam-history', icon: 'fas fa-history' },
    { label: 'Take Exam', route: '/student/exam', icon: 'fas fa-edit' },
    { label: 'My Subjects', route: '/student/add-subjects', icon: 'fas fa-book' }
  ];

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateNavItems();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isStudent(): boolean {
    return this.authService.isStudent();
  }

  private updateNavItems(): void {
    if (this.isAdmin) {
      this.navItems = this.adminNavItems;
    } else if (this.isStudent) {
      this.navItems = this.studentNavItems;
    } else {
      this.navItems = [];
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.email) return 'U';
    
    const emailParts = this.currentUser.email.split('@')[0];
    return emailParts.charAt(0).toUpperCase();
  }

  getUserName(): string {
    if (!this.currentUser?.email) return 'User';
    return this.currentUser.email.split('@')[0];
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    const currentNavItem = this.navItems.find(item => item.route === url);
    return currentNavItem?.label || 'Dashboard';
  }

  logout(): void {
    this.authService.logout();
  }
}
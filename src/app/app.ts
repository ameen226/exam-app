import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { SidebarComponent } from './features/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.html' 
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  showSidebar = false;
  
  // Routes where sidebar should be hidden
  private hideSidebarRoutes = ['/login', '/register'];

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateSidebarVisibility(event.url);
      });

    // Listen to authentication state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateSidebarVisibility(this.router.url);
      });

    // Initial check
    this.updateSidebarVisibility(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSidebarVisibility(currentUrl: string): void {
    const isAuthPage = this.hideSidebarRoutes.some(route => currentUrl.startsWith(route));
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Show sidebar if user is authenticated and not on auth pages
    this.showSidebar = isAuthenticated && !isAuthPage;
  }
}
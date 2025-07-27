import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { DashboardCard } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  dashboardCards: DashboardCard[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.dashboardStats = stats;
        this.createDashboardCards(stats);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
        console.error('Dashboard stats error:', error);
      }
    });
  }

  private createDashboardCards(stats: DashboardStats): void {
    this.dashboardCards = [
      {
        title: 'Students Number',
        value: stats.totalStudents,
        type: 'default'
      },
      {
        title: 'Exams Completed',
        value: stats.examsCompleted,
        type: 'default'
      },
      {
        title: 'Passed Exams Number',
        value: stats.passedExams,
        type: 'success'
      },
      {
        title: 'Failed Exams Number',
        value: stats.failedExams,
        type: 'danger'
      }
    ];
  }

  // Method to format numbers with commas
  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // Method to retry loading stats
  retryLoadStats(): void {
    this.loadDashboardStats();
  }
}

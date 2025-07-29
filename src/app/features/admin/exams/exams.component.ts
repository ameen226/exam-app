// src/app/features/admin/exams/exams.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import { ExamRecordDto, PagedResult, PaginationParameters } from '../../../core/models/exam.model';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit, OnDestroy {
  private examService = inject(ExamService);
  private destroy$ = new Subject<void>();

  examData: PagedResult<ExamRecordDto> = {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  };

  loading = false;
  errorMessage = '';

  currentPagination: PaginationParameters = {
    pageNumber: 1,
    pageSize: 10
  };

  // Expose Math to template
  Math = Math;

  ngOnInit(): void {
    this.loadExams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExams(): void {
    this.loading = true;
    this.errorMessage = '';

    this.examService.getExamHistories(this.currentPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.examData = response;
          this.loading = false;
          console.log('Exams loaded:', response);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load exam histories';
          this.loading = false;
          console.error('Error loading exams:', error);
        }
      });
  }

  changePage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages && page !== this.currentPagination.pageNumber) {
      this.currentPagination.pageNumber = page;
      this.loadExams();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.changePage(this.currentPagination.pageNumber - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.changePage(this.currentPagination.pageNumber + 1);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.examData.totalCount / this.examData.pageSize);
  }

  hasPreviousPage(): boolean {
    return this.currentPagination.pageNumber > 1;
  }

  hasNextPage(): boolean {
    return this.currentPagination.pageNumber < this.getTotalPages();
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPagination.pageNumber;
    const pages: number[] = [];

    // Show up to 5 pages around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  formatDateTime(date: Date): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  formatScore(score: number): string {
    return Math.round(score).toString();
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'text-success fw-bold';
    if (score >= 80) return 'text-info fw-bold';
    if (score >= 70) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  }
}
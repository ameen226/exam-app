import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-exam-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-history.component.html',
  styleUrls: ['./exam-history.component.scss']
})
export class ExamsHistoryComponent implements OnInit {
  private http = inject(HttpClient);

  examHistory: ExamRecord[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalPagesArray: number[] = [];

  ngOnInit(): void {
    this.fetchExamHistory();
  }

  fetchExamHistory(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<PagedResult<ExamRecord>>(
        `https://localhost:7198/api/me/exam/history?pageNumber=${this.currentPage}&pageSize=${this.pageSize}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          this.examHistory = res.items;
          this.totalPages = Math.ceil(res.totalCount / this.pageSize);
          this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        },
        error: (err) => {
          console.error('Failed to load exam history', err);
        }
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchExamHistory();
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 90) return 'score-badge score-excellent';
    if (score >= 80) return 'score-badge score-good';
    if (score >= 70) return 'score-badge score-average';
    return 'score-badge score-poor';
  }
}

// --- Types ---

interface ExamRecord {
  subjectName: string;
  startedAt: string;
  submitedAt: string;
  score: number;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

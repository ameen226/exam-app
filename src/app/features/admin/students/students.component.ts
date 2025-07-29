import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StudentManagementService } from '../../../core/services/student-management.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginatedResult, PaginationParameters, Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentManagementService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  studentsData: PaginatedResult<Student> = {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };  
  
  loading = false;
  errorMessage = '';

  currentPagination: PaginationParameters = {
    pageNumber: 1,
    pageSize: 10
  };

  // Avatar colors array matching Bootstrap colors from your HTML
  private avatarColors = [
    '#0d6efd', // primary
    '#17a2b8', // info  
    '#ffc107', // warning
    '#6c757d', // secondary
    '#dc3545', // danger
    '#198754', // success
  ];

  // ✅ Expose Math to template
  Math = Math;

  ngOnInit(): void {
    this.loadStudents();
    
    // ✅ Subscribe to students data changes for real-time updates
    this.studentService.students$
      .pipe(takeUntil(this.destroy$))
      .subscribe(studentsData => {
        if (studentsData) {
          this.studentsData = studentsData;
          console.log('Students data updated from service:', studentsData);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.studentService.getAllStudents(this.currentPagination).subscribe({
      next: (response) => {
        this.studentsData = response;
        this.loading = false;
        console.log('Students loaded:', response);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load students';
        this.loading = false;
        console.error('Error loading students:', error);
      }
    });
  }

  toggleStudentStatus(student: Student): void {
    console.log('Toggle button clicked for student:', student.id, 'Current status:', student.enabled);
    
    // ✅ Check if toggle is already in progress (from service)
    if (this.studentService.isToggleInProgress(student.id)) {
      console.log('❌ Toggle BLOCKED - already in progress for student:', student.id);
      return;
    }

    const newStatus = !student.enabled;
    console.log(`✅ Starting toggle for student ${student.id} to ${newStatus ? 'enabled' : 'disabled'}`);

    this.studentService.updateStudentStatus(student.id, newStatus).subscribe({
      next: (response) => {
        console.log(`✅ Toggle SUCCESS for student ${student.id} to ${newStatus ? 'enabled' : 'disabled'}:`, response);
        // ✅ Service automatically updates the local data after successful API call
      },
      error: (error) => {
        console.log(`❌ Toggle ERROR for student ${student.id}:`, error);
        
        // Don't show error message for double-click prevention
        if (error.message !== 'Toggle operation already in progress') {
          this.errorMessage = error.message || 'Failed to update student status';
          // Auto-clear error after 5 seconds
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      }
    });
  }

  // ✅ Use service method to check toggle state
  isToggling(studentId: string): boolean {
    return this.studentService.isToggleInProgress(studentId);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= (this.studentsData?.totalPages || 1)) {
      this.currentPagination.pageNumber = page;
      this.loadStudents();
    }
  }

  getVisiblePages(): number[] {
    if (!this.studentsData) return [];

    const totalPages = this.studentsData.totalPages;
    const currentPage = this.currentPagination.pageNumber;
    const pages: number[] = [];

    // Show up to 5 pages like in your HTML
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(studentId: string): string {
    // Generate consistent color based on student ID to match your HTML examples
    const hash = studentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
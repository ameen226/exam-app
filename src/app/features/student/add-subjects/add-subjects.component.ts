import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { SubjectService } from "../../../core/services/subject.service";
import { SubjectCardData } from "../../../core/models/subject.model";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-add-subjects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-subjects.component.html',
  styleUrls: ['./add-subjects.component.scss']
})
export class AddSubjectsComponent implements OnInit {
  private subjectService = inject(SubjectService);
  
  subjects: SubjectCardData[] = [];
  selectedSubjects: number[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  showSuccessModal = false;
  lastAddedCount = 0;
  lastAddedSubjects: string[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load both all subjects and student's enrolled subjects
    forkJoin({
      allSubjects: this.subjectService.getAllSubjects(),
      enrolledSubjects: this.subjectService.getStudentSubjects()
    }).subscribe({
      next: (result) => {
        this.loading = false;
        
        if (!result.allSubjects.success) {
          this.error = result.allSubjects.message || 'Failed to load subjects';
          return;
        }

        const allSubjects = result.allSubjects.data || [];
        const enrolledSubjects = result.enrolledSubjects.success ? (result.enrolledSubjects.data || []) : [];
        const enrolledIds = new Set(enrolledSubjects.map(s => s.id));

        this.subjects = allSubjects.map(subject => ({
          ...subject,
          enrolled: enrolledIds.has(subject.id),
          selected: false
        }));
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load data';
        console.error('Error:', error);
      }
    });
  }

  toggleSubject(subjectId: number) {
    const subject = this.subjects.find(s => s.id === subjectId);
    if (!subject || subject.enrolled) return;

    subject.selected = !subject.selected;
    
    if (subject.selected) {
      this.selectedSubjects.push(subjectId);
    } else {
      this.selectedSubjects = this.selectedSubjects.filter(id => id !== subjectId);
    }
  }

  clearSelection() {
    if (this.selectedSubjects.length > 0) {
      if (confirm('Are you sure you want to clear all selected subjects?')) {
        this.selectedSubjects = [];
        this.subjects.forEach(subject => {
          subject.selected = false;
        });
      }
    }
  }

  addSelectedSubjects() {
    if (this.selectedSubjects.length === 0) return;

    this.submitting = true;
    
    this.subjectService.addMultipleSubjectsToStudent(this.selectedSubjects).subscribe({
      next: (responses) => {
        this.submitting = false;
        
        const successfulResponses = responses.filter(r => r.success);
        const failedResponses = responses.filter(r => !r.success);

        if (failedResponses.length > 0) {
          // Some failed
          const errorMessages = failedResponses.flatMap(r => r.errors || [r.message]).join(', ');
          this.error = `Some subjects failed to add: ${errorMessages}`;
        }

        if (successfulResponses.length > 0) {
          // Some succeeded
          this.lastAddedCount = successfulResponses.length;
          this.lastAddedSubjects = this.selectedSubjects
            .slice(0, successfulResponses.length)
            .map(id => {
              const subject = this.subjects.find(s => s.id === id);
              return subject ? subject.name : '';
            })
            .filter(name => name);

          // Mark successfully added subjects as enrolled
          this.selectedSubjects.slice(0, successfulResponses.length).forEach(id => {
            const subject = this.subjects.find(s => s.id === id);
            if (subject) {
              subject.enrolled = true;
              subject.selected = false;
            }
          });

          // Clear selection
          this.selectedSubjects = [];
          this.showSuccessModal = true;
        }
      },
      error: (error) => {
        this.submitting = false;
        this.error = 'Failed to add subjects';
        console.error('Error:', error);
      }
    });
  }

  getStatusText(subject: SubjectCardData): string {
    if (subject.enrolled) return 'Enrolled';
    if (subject.selected) return 'Selected';
    return 'Available';
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}

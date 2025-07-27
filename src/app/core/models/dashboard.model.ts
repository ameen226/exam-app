export interface DashboardStats {
    totalStudents: number;
    examsCompleted: number;
    passedExams: number;
    failedExams: number;
}

export interface DashboardCard {
    title: string;
    value: number;
    type: 'default' | 'success' | 'danger';
}
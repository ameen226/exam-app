export interface DashboardStats {
    totalStudents: number;
    totalExamsSubmitted: number;
    totalPassedExams: number;
    totalFailedExams: number;
}

export interface DashboardCard {
    title: string;
    value: number;
    type: 'default' | 'success' | 'danger';
}
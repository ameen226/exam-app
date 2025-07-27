import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { HttpClient } from "@angular/common/http";
import { DashboardStats } from "../models/dashboard.model";
import { Observable } from "rxjs";

@Injectable ({
    providedIn: 'root'
})

export class DashboardService {
    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard`);
    }
}
import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AdminFinanceControllerApiService } from '../../core/api/api/adminFinanceController.service';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  loadDashboard() {
    const today = new Date();
    const year = today.getFullYear();

    const monthStart = new Date(year, today.getMonth(), 1);

    return forkJoin({
      summary: this.financeApi.summary(undefined, undefined),
      monthly: this.financeApi.monthly(year),
      weekly: this.financeApi.weekly(
        this.toDateInput(monthStart),
        this.toDateInput(today),
      ),
      payroll: this.financeApi.payrollSummary(
        this.toDateInput(monthStart),
        this.toDateInput(today),
      ),
    });
  }

  private toDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
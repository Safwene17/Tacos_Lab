import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { AdminFinanceControllerApiService } from '../../../core/api/api/adminFinanceController.service';

import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce-metrics/ecommerce-metrics';
import { MonthlySalesChartComponent } from '../../../shared/components/monthly-sales-chart/monthly-sales-chart';
import { MonthlyTargetComponent } from '../../../shared/components/monthly-target/monthly-target';
import { StatisticsChartComponent } from '../../../shared/components/statics-chart/statics-chart';
import { DemographicCardComponent } from '../../../shared/components/demographic-card/demographic-card';
import { RecentOrdersComponent } from '../../../shared/components/recent-orders/recent-orders';

import type { DashboardSummaryResponseDto } from '../../../core/api/model/dashboardSummaryResponse';
import type { PayrollSummaryResponseDto } from '../../../core/api/model/payrollSummaryResponse';
import type { PeriodFinancialStatResponseDto } from '../../../core/api/model/periodFinancialStatResponse';
import type { CategoryBreakdownResponseDto } from '../../../core/api/model/categoryBreakdownResponse';
import type { PaymentMethodBreakdownResponseDto } from '../../../core/api/model/paymentMethodBreakdownResponse';
import type { TransactionResponseDto } from '../../../core/api/model/transactionResponse';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    MonthlyTargetComponent,
    StatisticsChartComponent,
    DemographicCardComponent,
    RecentOrdersComponent,
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  readonly loading = signal(true);

  readonly summary = signal<DashboardSummaryResponseDto | undefined>(undefined);
  readonly payroll = signal<PayrollSummaryResponseDto | undefined>(undefined);
  readonly monthlyStats = signal<PeriodFinancialStatResponseDto[]>([]);
  readonly weeklyStats = signal<PeriodFinancialStatResponseDto[]>([]);
  readonly categoryBreakdown = signal<CategoryBreakdownResponseDto[]>([]);
  readonly paymentMethods = signal<PaymentMethodBreakdownResponseDto[]>([]);
  readonly recentTransactions = signal<TransactionResponseDto[]>([]);

  readonly currentYear = computed(() => new Date().getFullYear());

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);

    forkJoin({
      summary: this.financeApi.summary(),
      payroll: this.financeApi.payrollSummary(),
      monthly: this.financeApi.monthly(this.currentYear()),
      weekly: this.financeApi.weekly(),
      categories: this.financeApi.byCategory(),
      paymentMethods: this.financeApi.paymentMethods(),
      transactions: this.financeApi.transactions({
        page: 0,
        size: 5,
        sort: ['transactionDate,desc'],
      }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.summary.set(response.summary.data);
          this.payroll.set(response.payroll.data);
          this.monthlyStats.set(response.monthly.data ?? []);
          this.weeklyStats.set(response.weekly.data ?? []);
          this.categoryBreakdown.set(response.categories.data ?? []);
          this.paymentMethods.set(response.paymentMethods.data ?? []);
          this.recentTransactions.set(response.transactions.data?.content ?? []);
        },
        error: () => {
          toast.error('Unable to load dashboard data.');
        },
      });
  }
}
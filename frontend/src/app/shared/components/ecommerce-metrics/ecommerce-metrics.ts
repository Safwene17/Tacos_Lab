import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { DashboardSummaryResponseDto } from '../../../core/api/model/dashboardSummaryResponse';
import type { PayrollSummaryResponseDto } from '../../../core/api/model/payrollSummaryResponse';

@Component({
  selector: 'app-ecommerce-metrics',
  standalone: true,
  templateUrl: './ecommerce-metrics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceMetricsComponent {
  readonly summary = input<DashboardSummaryResponseDto>();
  readonly payroll = input<PayrollSummaryResponseDto>();

  readonly revenue = computed(() => this.summary()?.totalIncome ?? 0);
  readonly expenses = computed(() => this.summary()?.totalExpenses ?? 0);
  readonly netProfit = computed(() => this.summary()?.netProfit ?? 0);
  readonly payrollTotal = computed(() => this.payroll()?.totalPayroll ?? 0);

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
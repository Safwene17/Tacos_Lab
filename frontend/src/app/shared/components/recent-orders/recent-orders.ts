import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { PeriodFinancialStatResponseDto } from '../../../core/api/model/periodFinancialStatResponse';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  templateUrl: './recent-orders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentOrdersComponent {
  readonly weeklyStats = input<PeriodFinancialStatResponseDto[]>([]);

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
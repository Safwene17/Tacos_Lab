import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { TransactionResponseDto } from '../../../core/api/model/transactionResponse';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  templateUrl: './recent-orders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentOrdersComponent {
  readonly transactions = input<TransactionResponseDto[]>([]);

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }

  badgeClass(type?: string): string {
    return type === 'INCOME'
      ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
      : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
  }
}
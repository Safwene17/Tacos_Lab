import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { PayrollSummaryResponseDto } from '../../../core/api/model/payrollSummaryResponse';

@Component({
  selector: 'app-payroll-card',
  standalone: true,
  templateUrl: './payroll-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollCard {
  readonly payroll = input<PayrollSummaryResponseDto>();

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { PayrollSummaryResponseDto } from '../../../core/api/model/payrollSummaryResponse';

@Component({
  selector: 'app-demographic-card',
  standalone: true,
  templateUrl: './demographic-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemographicCardComponent {
  readonly payroll = input<PayrollSummaryResponseDto>();

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
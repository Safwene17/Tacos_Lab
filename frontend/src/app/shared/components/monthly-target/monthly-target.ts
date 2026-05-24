import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';

import type { DashboardSummaryResponseDto } from '../../../core/api/model/dashboardSummaryResponse';

const MONTHLY_REVENUE_TARGET = 50000;

@Component({
  selector: 'app-monthly-target',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './monthly-target.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyTargetComponent {
  readonly summary = input<DashboardSummaryResponseDto>();

  readonly progress = computed(() => {
    const revenue = this.summary()?.totalIncome ?? 0;
    return Math.min(Math.round((revenue / MONTHLY_REVENUE_TARGET) * 100), 100);
  });

  readonly series = computed<ApexNonAxisChartSeries>(() => [this.progress()]);

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 330,
    sparkline: { enabled: true },
  };

  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -85,
      endAngle: 85,
      hollow: { size: '80%' },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: -40,
          color: '#1D2939',
          formatter: (val: number) => `${Math.round(val)}%`,
        },
      },
    },
  };

  public fill: ApexFill = {
    type: 'solid',
    colors: ['#465FFF'],
  };

  public stroke: ApexStroke = {
    lineCap: 'round',
  };

  public labels: string[] = ['Progress'];
  public colors: string[] = ['#465FFF'];

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }

  readonly target = MONTHLY_REVENUE_TARGET;
}
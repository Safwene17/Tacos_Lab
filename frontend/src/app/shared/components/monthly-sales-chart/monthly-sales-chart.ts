import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';

import type { PeriodFinancialStatResponseDto } from '../../../core/api/model/periodFinancialStatResponse';

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './monthly-sales-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlySalesChartComponent {
  readonly monthlyStats = input<PeriodFinancialStatResponseDto[]>([]);

  readonly series = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Revenue',
      data: this.monthlyStats().map((item) => item.income ?? 0),
    },
  ]);

  readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.monthlyStats().map((item) => this.monthLabel(item.period)),
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 180,
    toolbar: { show: false },
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ['transparent'],
  };

  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
  };

  public yaxis: ApexYAxis = {
    title: { text: undefined },
    labels: {
      formatter: (value) => `${Math.round(value)} RON`,
    },
  };

  public grid: ApexGrid = { yaxis: { lines: { show: true } } };

  public fill: ApexFill = { opacity: 1 };

  public tooltip: ApexTooltip = {
    x: { show: false },
    y: {
      formatter: (val: number) => this.money(val),
    },
  };

  public colors: string[] = ['#465fff'];

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  private monthLabel(value?: string): string {
    if (!value) {
      return '';
    }

    return value.slice(0, 3);
  }

  private money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
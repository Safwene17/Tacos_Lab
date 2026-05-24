import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
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

  readonly chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 180,
    toolbar: { show: false },
  };

  readonly plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  };

  readonly dataLabels: ApexDataLabels = { enabled: false };

  readonly stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ['transparent'],
  };

  readonly legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
  };

  readonly yaxis: ApexYAxis = {
    title: { text: undefined },
  };

  readonly grid: ApexGrid = { yaxis: { lines: { show: true } } };

  readonly fill: ApexFill = { opacity: 1 };

  readonly tooltip: ApexTooltip = {
    x: { show: false },
    y: {
      formatter: (val: number) => this.money(val),
    },
  };

  readonly colors: string[] = ['#465fff'];

  private monthLabel(value?: string): string {
    return value ? value.slice(0, 3) : '';
  }

  private money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
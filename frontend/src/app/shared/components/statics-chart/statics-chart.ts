import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  input,
} from '@angular/core';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { ChartTabComponent } from '../common/chart-tab/chart-tab.component';
import type { PeriodFinancialStatResponseDto } from '../../../core/api/model/periodFinancialStatResponse';

@Component({
  selector: 'app-statics-chart',
  standalone: true,
  imports: [NgApexchartsModule, ChartTabComponent],
  templateUrl: './statics-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('datepicker') datepicker!: ElementRef<HTMLInputElement>;

  readonly weeklyStats = input<PeriodFinancialStatResponseDto[]>([]);

  private flatpickrInstance?: Instance;

  readonly series = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Income',
      data: this.weeklyStats().map((item) => item.income ?? 0),
    },
    {
      name: 'Expenses',
      data: this.weeklyStats().map((item) => item.expenses ?? 0),
    },
  ]);

  readonly xaxis = computed<ApexXAxis>(() => ({
    type: 'category',
    categories: this.weeklyStats().map((item) => item.period ?? ''),
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  }));

  ngAfterViewInit(): void {
    this.flatpickrInstance = flatpickr(this.datepicker.nativeElement, {
      mode: 'range',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'M j',
      defaultDate: [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()],
      onReady: (_selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');

        const customClass = instance.element.getAttribute('data-class');

        if (customClass) {
          instance.calendarContainer?.classList.add(customClass);
        }
      },
      onChange: (_selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
      },
    });
  }

  ngOnDestroy(): void {
    this.flatpickrInstance?.destroy();
  }

  readonly chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 310,
    type: 'area',
    toolbar: {
      show: false,
    },
  };

  readonly colors: string[] = ['#465FFF', '#9CB9FF'];

  readonly stroke: ApexStroke = {
    curve: 'straight',
    width: [2, 2],
  };

  readonly fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  };

  readonly markers: ApexMarkers = {
    size: 0,
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 6,
    },
  };

  readonly grid: ApexGrid = {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  };

  readonly dataLabels: ApexDataLabels = {
    enabled: false,
  };

  readonly tooltip: ApexTooltip = {
    enabled: true,
    y: {
      formatter: (value: number) => this.money(value),
    },
  };

  readonly yaxis: ApexYAxis = {
    labels: {
      style: {
        fontSize: '12px',
        colors: ['#6B7280'],
      },
      formatter: (value) => `${Math.round(value)}`,
    },
    title: {
      text: '',
      style: {
        fontSize: '0px',
      },
    },
  };

  readonly legend: ApexLegend = {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  };

  private money(value: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import flatpickr from 'flatpickr';
import { LabelComponent } from '../label/label.component';
import "flatpickr/dist/flatpickr.css";

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: `
    :host ::ng-deep .flatpickr-calendar {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    }
    
    :host ::ng-deep .dark .flatpickr-calendar {
      background: #111827;
      border-color: #374151;
    }
    
    :host ::ng-deep .flatpickr-months {
      background: white;
    }
    
    :host ::ng-deep .dark .flatpickr-months {
      background: #111827;
    }
    
    :host ::ng-deep .flatpickr-month {
      color: #111827;
    }
    
    :host ::ng-deep .dark .flatpickr-month {
      color: white;
    }
    
    :host ::ng-deep .flatpickr-prev-month,
    :host ::ng-deep .flatpickr-next-month {
      color: #4b5563;
    }
    
    :host ::ng-deep .dark .flatpickr-prev-month,
    :host ::ng-deep .dark .flatpickr-next-month {
      color: #9ca3af;
    }
    
    :host ::ng-deep .flatpickr-day {
      color: #374151;
    }
    
    :host ::ng-deep .dark .flatpickr-day {
      color: #d1d5db;
    }
    
    :host ::ng-deep .flatpickr-day.selected {
      background: #3b82f6;
      color: white;
    }
    
    :host ::ng-deep .flatpickr-day:hover {
      background: #f3f4f6;
    }
    
    :host ::ng-deep .dark .flatpickr-day:hover {
      background: #374151;
    }
    
    :host ::ng-deep .flatpickr-innerContainer {
      border-top: 1px solid #e5e7eb;
    }
    
    :host ::ng-deep .dark .flatpickr-innerContainer {
      border-top-color: #374151;
    }
  `
})
export class DatePickerComponent implements AfterViewInit, OnDestroy {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    if (this.dateInput) {
      this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
        mode: this.mode,
        inline: false,
        static: false,
        monthSelectorType: 'dropdown',
        dateFormat: 'Y-m-d',
        defaultDate: this.defaultDate,
        prevArrow: '<svg class="flatpickr-prev-month" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
        nextArrow: '<svg class="flatpickr-next-month" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
        onChange: (selectedDates, dateStr, instance) => {
          this.dateChange.emit({ selectedDates, dateStr, instance });
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}

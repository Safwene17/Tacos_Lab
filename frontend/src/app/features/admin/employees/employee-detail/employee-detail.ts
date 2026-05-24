import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminEmployeeControllerApiService } from '../../../../core/api/api/adminEmployeeController.service';

import type { EmployeeResponseDto } from '../../../../core/api/model/employeeResponse';
import type { PayrollRecordResponseDto } from '../../../../core/api/model/payrollRecordResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  templateUrl: './employee-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeApi = inject(AdminEmployeeControllerApiService);

  readonly employeeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  readonly employee = signal<EmployeeResponseDto | null>(null);
  readonly payrollRecords = signal<PayrollRecordResponseDto[]>([]);

  readonly loadingEmployee = signal(false);
  readonly loadingPayroll = signal(false);
  readonly employeeError = signal<string | null>(null);
  readonly payrollError = signal<string | null>(null);

  readonly payrollPage = signal(0);
  readonly payrollSize = signal(10);
  readonly payrollTotalPages = signal(0);
  readonly payrollTotalElements = signal(0);

  readonly payrollPages = computed(() =>
    Array.from({ length: this.payrollTotalPages() }, (_, index) => index),
  );

  readonly initials = computed(() => {
    const employee = this.employee();

    if (!employee) {
      return '--';
    }

    const first = employee.firstName?.charAt(0) ?? '';
    const last = employee.lastName?.charAt(0) ?? '';

    return `${first}${last}`.toUpperCase() || '--';
  });

  constructor() {
    if (!this.employeeId()) {
      void this.router.navigateByUrl('/admin/employees');
      return;
    }

    this.loadEmployee();
    this.loadPayrollRecords();
  }

  loadEmployee(): void {
    const id = this.employeeId();

    if (!id) {
      return;
    }

    this.loadingEmployee.set(true);
    this.employeeError.set(null);

    this.employeeApi
      .employee(id)
      .pipe(finalize(() => this.loadingEmployee.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.employeeError.set(response.message ?? 'Unable to load employee.');
            return;
          }

          this.employee.set(response.data);
        },
        error: (error: unknown) => {
          this.employeeError.set(this.errorMessage(error));
        },
      });
  }

  loadPayrollRecords(): void {
    const id = this.employeeId();

    if (!id) {
      return;
    }

    this.loadingPayroll.set(true);
    this.payrollError.set(null);

    const pageable: PageableDto = {
      page: this.payrollPage(),
      size: this.payrollSize(),
      sort: ['paymentDate,desc'],
    };

    this.employeeApi
      .payrollRecords(id, pageable)
      .pipe(finalize(() => this.loadingPayroll.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.payrollError.set(response.message ?? 'Unable to load payroll records.');
            return;
          }

          this.payrollRecords.set(response.data.content ?? []);
          this.payrollPage.set(response.data.page ?? 0);
          this.payrollSize.set(response.data.size ?? 10);
          this.payrollTotalPages.set(response.data.totalPages ?? 0);
          this.payrollTotalElements.set(response.data.totalElements ?? 0);
        },
        error: (error: unknown) => {
          this.payrollError.set(this.errorMessage(error));
        },
      });
  }

  retry(): void {
    this.loadEmployee();
    this.loadPayrollRecords();
  }

  backToEmployees(): void {
    void this.router.navigateByUrl('/admin/employees');
  }

  editEmployee(): void {
    const id = this.employeeId();

    if (!id) {
      return;
    }

    void this.router.navigate(['/admin/employees', id, 'edit']);
  }

  goToPayrollPage(page: number): void {
    if (page < 0 || page >= this.payrollTotalPages() || page === this.payrollPage()) {
      return;
    }

    this.payrollPage.set(page);
    this.loadPayrollRecords();
  }

  previousPayrollPage(): void {
    this.goToPayrollPage(this.payrollPage() - 1);
  }

  nextPayrollPage(): void {
    this.goToPayrollPage(this.payrollPage() + 1);
  }

  statusBadgeClass(status?: string): string {
    if (status === 'ACTIVE') {
      return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  date(value?: string): string {
    if (!value) {
      return '-';
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
      return '-';
    }

    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  period(record: PayrollRecordResponseDto): string {
    if (!record.periodStart && !record.periodEnd) {
      return '-';
    }

    return `${this.date(record.periodStart)} → ${this.date(record.periodEnd)}`;
  }

  value(value?: string | number | null): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error.';
  }

  //-------------PAYROLL RECORDS-----------------------------------------------

  createPayrollRecord(): void {
    const id = this.employeeId();

    if (!id) {
      return;
    }

    void this.router.navigate(['/admin/employees', id, 'payroll', 'new']);
  }

  editPayrollRecord(record: PayrollRecordResponseDto): void {
  const employeeId = this.employeeId();

  if (!employeeId || !record.id) {
    return;
  }

  void this.router.navigate([
    '/admin/employees',
    employeeId,
    'payroll',
    record.id,
    'edit',
  ]);
}

deletePayrollRecord(record: PayrollRecordResponseDto): void {
  if (!record.id) {
    return;
  }

  const confirmed = window.confirm('Delete this payroll record? This will also delete the linked salary transaction.');

  if (!confirmed) {
    return;
  }

  this.employeeApi.deletePayrollRecord(record.id).subscribe({
    next: () => {
      toast.success('Payroll record deleted successfully.');
      this.loadEmployee();
      this.loadPayrollRecords();
    },
    error: (error: unknown) => {
      toast.error(this.errorMessage(error));
    },
  });
}
}

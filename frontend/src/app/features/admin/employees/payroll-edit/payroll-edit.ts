import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminEmployeeControllerApiService } from '../../../../core/api/api/adminEmployeeController.service';

import { PayrollRecordRequestDto } from '../../../../core/api/model/payrollRecordRequest';
import type { EmployeeResponseDto } from '../../../../core/api/model/employeeResponse';
import type { PayrollRecordResponseDto } from '../../../../core/api/model/payrollRecordResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

type PaymentMethod = PayrollRecordRequestDto.PaymentMethodEnum;

type PayrollForm = FormGroup<{
  amount: FormControl<number | null>;
  paymentDate: FormControl<string>;
  periodStart: FormControl<string>;
  periodEnd: FormControl<string>;
  paymentMethod: FormControl<PaymentMethod>;
  notes: FormControl<string>;
}>;

@Component({
  selector: 'app-payroll-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './payroll-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollEdit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeApi = inject(AdminEmployeeControllerApiService);

  readonly PayrollRecordRequestDto = PayrollRecordRequestDto;

  readonly employeeId = signal<string | null>(this.route.snapshot.paramMap.get('employeeId'));
  readonly payrollRecordId = signal<string | null>(this.route.snapshot.paramMap.get('payrollRecordId'));

  readonly employee = signal<EmployeeResponseDto | null>(null);
  readonly payrollRecord = signal<PayrollRecordResponseDto | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form: PayrollForm = new FormGroup({
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    paymentDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    periodStart: new FormControl('', {
      nonNullable: true,
    }),
    periodEnd: new FormControl('', {
      nonNullable: true,
    }),
    paymentMethod: new FormControl<PaymentMethod>(
      PayrollRecordRequestDto.PaymentMethodEnum.BankTransfer,
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    notes: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor() {
    if (!this.employeeId() || !this.payrollRecordId()) {
      void this.router.navigateByUrl('/admin/employees');
      return;
    }

    this.loadData();
  }

  loadData(): void {
    const employeeId = this.employeeId();

    if (!employeeId) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: 0,
      size: 100,
      sort: ['paymentDate,desc'],
    };

    this.employeeApi.employee(employeeId).subscribe({
      next: (employeeResponse) => {
        if (!employeeResponse.success || !employeeResponse.data) {
          this.loading.set(false);
          this.error.set(employeeResponse.message ?? 'Unable to load employee.');
          return;
        }

        this.employee.set(employeeResponse.data);

        this.employeeApi
          .payrollRecords(employeeId, pageable)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (payrollResponse) => {
              if (!payrollResponse.success || !payrollResponse.data) {
                this.error.set(payrollResponse.message ?? 'Unable to load payroll record.');
                return;
              }

              const record = (payrollResponse.data.content ?? []).find(
                (item) => item.id === this.payrollRecordId(),
              );

              if (!record) {
                this.error.set('Payroll record not found.');
                return;
              }

              this.payrollRecord.set(record);
              this.patchForm(record);
            },
            error: (error: unknown) => {
              this.error.set(this.errorMessage(error));
            },
          });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.errorMessage(error));
      },
    });
  }

  submit(): void {
    const employeeId = this.employeeId();
    const payrollRecordId = this.payrollRecordId();

    if (!employeeId || !payrollRecordId || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: PayrollRecordRequestDto = {
      amount: value.amount ?? 0,
      paymentDate: value.paymentDate,
      periodStart: value.periodStart || undefined,
      periodEnd: value.periodEnd || undefined,
      paymentMethod: value.paymentMethod,
      notes: value.notes.trim() || undefined,
    };

    this.saving.set(true);

    this.employeeApi
      .updatePayrollRecord(payrollRecordId, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to update payroll record.');
            return;
          }

          toast.success(response.message ?? 'Payroll record updated successfully.');
          void this.router.navigate(['/admin/employees', employeeId]);
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  cancel(): void {
    const employeeId = this.employeeId();

    if (employeeId) {
      void this.router.navigate(['/admin/employees', employeeId]);
      return;
    }

    void this.router.navigateByUrl('/admin/employees');
  }

  fieldError(controlName: keyof PayrollForm['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['min']) {
      return 'Value must be greater than zero.';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    return 'Invalid value.';
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private patchForm(record: PayrollRecordResponseDto): void {
    this.form.patchValue({
      amount: record.amount ?? null,
      paymentDate: record.paymentDate ?? '',
      periodStart: record.periodStart ?? '',
      periodEnd: record.periodEnd ?? '',
      paymentMethod: this.resolvePaymentMethod(record.paymentMethod),
      notes: record.notes ?? '',
    });
  }

  private resolvePaymentMethod(value?: string): PaymentMethod {
    const values = Object.values(PayrollRecordRequestDto.PaymentMethodEnum);

    if (value && values.includes(value as PaymentMethod)) {
      return value as PaymentMethod;
    }

    return PayrollRecordRequestDto.PaymentMethodEnum.BankTransfer;
  }

  private applyApiErrors(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      return;
    }

    const errors = error.error?.errors as Record<string, string> | undefined;

    if (!errors) {
      return;
    }

    Object.entries(errors).forEach(([field, message]) => {
      const control = this.form.get(field);

      if (control) {
        control.setErrors({
          ...(control.errors ?? {}),
          server: message,
        });

        control.markAsTouched();
      }
    });
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
}
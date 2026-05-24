import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminEmployeeControllerApiService } from '../../../../core/api/api/adminEmployeeController.service';

import { PayrollRecordRequestDto } from '../../../../core/api/model/payrollRecordRequest';
import type { EmployeeResponseDto } from '../../../../core/api/model/employeeResponse';

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
  selector: 'app-payroll-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './payroll-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollCreate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeApi = inject(AdminEmployeeControllerApiService);

  readonly PayrollRecordRequestDto = PayrollRecordRequestDto;

  readonly employeeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly employee = signal<EmployeeResponseDto | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form: PayrollForm = new FormGroup({
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    paymentDate: new FormControl(this.today(), {
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
    if (!this.employeeId()) {
      void this.router.navigateByUrl('/admin/employees');
      return;
    }

    this.loadEmployee();
  }

  loadEmployee(): void {
    const id = this.employeeId();

    if (!id) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.employeeApi
      .employee(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load employee.');
            return;
          }

          this.employee.set(response.data);

          if (!this.form.controls.amount.value) {
            this.form.controls.amount.setValue(response.data.salaryAmount ?? null);
          }
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  submit(): void {
    const employeeId = this.employeeId();

    if (!employeeId || this.form.invalid || this.saving()) {
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
      .createPayrollRecord(employeeId, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to create payroll record.');
            return;
          }

          toast.success(response.message ?? 'Payroll record created successfully.');
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

  private today(): string {
    return new Date().toISOString().slice(0, 10);
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
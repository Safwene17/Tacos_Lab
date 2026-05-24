import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminEmployeeControllerApiService } from '../../../../core/api/api/adminEmployeeController.service';

import { EmployeeRequestDto } from '../../../../core/api/model/employeeRequest';
import type { EmployeeResponseDto } from '../../../../core/api/model/employeeResponse';

type EmploymentStatus = EmployeeRequestDto.EmploymentStatusEnum;

type EmployeeForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string>;
  email: FormControl<string>;
  salaryAmount: FormControl<number | null>;
  role: FormControl<string>;
  employmentStatus: FormControl<EmploymentStatus>;
  firstWorkingDay: FormControl<string>;
  emergencyContactName: FormControl<string>;
  emergencyContactPhone: FormControl<string>;
  notes: FormControl<string>;
}>;

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeEdit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeApi = inject(AdminEmployeeControllerApiService);

  readonly EmployeeRequestDto = EmployeeRequestDto;

  readonly employeeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly employee = signal<EmployeeResponseDto | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form: EmployeeForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email],
    }),
    salaryAmount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    role: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(120)],
    }),
    employmentStatus: new FormControl<EmploymentStatus>(
      EmployeeRequestDto.EmploymentStatusEnum.Active,
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    firstWorkingDay: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    emergencyContactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(180)],
    }),
    emergencyContactPhone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(40)],
    }),
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
          this.patchForm(response.data);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  submit(): void {
    const id = this.employeeId();

    if (!id || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: EmployeeRequestDto = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phoneNumber: value.phoneNumber.trim(),
      email: value.email.trim() || undefined,
      salaryAmount: value.salaryAmount ?? 0,
      role: value.role.trim() || undefined,
      employmentStatus: value.employmentStatus,
      firstWorkingDay: value.firstWorkingDay,
      emergencyContactName: value.emergencyContactName.trim() || undefined,
      emergencyContactPhone: value.emergencyContactPhone.trim() || undefined,
      notes: value.notes.trim() || undefined,
    };

    this.saving.set(true);

    this.employeeApi
      .updateEmployee(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to update employee.');
            return;
          }

          toast.success(response.message ?? 'Employee updated successfully.');
          void this.router.navigate(['/admin/employees', id]);
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  cancel(): void {
    const id = this.employeeId();

    if (id) {
      void this.router.navigate(['/admin/employees', id]);
      return;
    }

    void this.router.navigateByUrl('/admin/employees');
  }

  fieldError(controlName: keyof EmployeeForm['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }

    if (control.errors['min']) {
      return 'Value must be greater than zero.';
    }

    if (control.errors['maxlength']) {
      return 'Value is too long.';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    return 'Invalid value.';
  }

  private patchForm(employee: EmployeeResponseDto): void {
    this.form.patchValue({
      firstName: employee.firstName ?? '',
      lastName: employee.lastName ?? '',
      phoneNumber: employee.phoneNumber ?? '',
      email: employee.email ?? '',
      salaryAmount: employee.salaryAmount ?? null,
      role: employee.role ?? '',
      employmentStatus:
        employee.employmentStatus === EmployeeRequestDto.EmploymentStatusEnum.Inactive
          ? EmployeeRequestDto.EmploymentStatusEnum.Inactive
          : EmployeeRequestDto.EmploymentStatusEnum.Active,
      firstWorkingDay: employee.firstWorkingDay ?? '',
      emergencyContactName: employee.emergencyContactName ?? '',
      emergencyContactPhone: employee.emergencyContactPhone ?? '',
      notes: employee.notes ?? '',
    });
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
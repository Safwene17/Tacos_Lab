import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminEmployeeControllerApiService } from '../../../../core/api/api/adminEmployeeController.service';

import { EmployeeRequestDto } from '../../../../core/api/model/employeeRequest';
import type { EmployeeResponseDto } from '../../../../core/api/model/employeeResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

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
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeList {
  private readonly employeeApi = inject(AdminEmployeeControllerApiService);
  private readonly router = inject(Router);

  readonly EmployeeRequestDto = EmployeeRequestDto;

  readonly employees = signal<EmployeeResponseDto[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly formOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly employeeToDelete = signal<EmployeeResponseDto | null>(null);

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index),
  );

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
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: this.page(),
      size: this.size(),
      sort: ['lastName,asc'],
    };

    this.employeeApi
      .employees(pageable)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load employees.');
            return;
          }

          this.employees.set(response.data.content ?? []);
          this.page.set(response.data.page ?? 0);
          this.size.set(response.data.size ?? 20);
          this.totalPages.set(response.data.totalPages ?? 0);
          this.totalElements.set(response.data.totalElements ?? 0);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  openCreateForm(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      salaryAmount: null,
      role: '',
      employmentStatus: EmployeeRequestDto.EmploymentStatusEnum.Active,
      firstWorkingDay: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
    });

    this.formOpen.set(true);
  }

  closeCreateForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
  }

  submitCreate(): void {
    if (this.form.invalid || this.saving()) {
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
      .createEmployee(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to create employee.');
            return;
          }

          toast.success(response.message ?? 'Employee created successfully.');
          this.formOpen.set(false);
          this.loadEmployees();
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  viewDetails(employee: EmployeeResponseDto): void {
    if (!employee.id) {
      return;
    }

    void this.router.navigate(['/admin/employees', employee.id]);
  }

  editEmployee(employee: EmployeeResponseDto): void {
    if (!employee.id) {
      return;
    }

    void this.router.navigate(['/admin/employees', employee.id, 'edit']);
  }

  askDelete(employee: EmployeeResponseDto): void {
    this.employeeToDelete.set(employee);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    if (this.deleting()) {
      return;
    }

    this.deleteDialogOpen.set(false);
    this.employeeToDelete.set(null);
  }

  confirmDelete(): void {
    const employee = this.employeeToDelete();

    if (!employee?.id || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.employeeApi
      .deleteEmployee(employee.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.employees.update((items) => items.filter((item) => item.id !== employee.id));
          this.deleteDialogOpen.set(false);
          this.employeeToDelete.set(null);
          toast.success('Employee deleted successfully.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.page()) {
      return;
    }

    this.page.set(page);
    this.loadEmployees();
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  statusBadgeClass(status?: string): string {
    if (status === 'ACTIVE') {
      return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  salary(employee: EmployeeResponseDto): string {
    return this.money(employee.salaryAmount ?? 0, employee.salaryCurrency ?? 'RON');
  }

  date(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
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

  private money(value: number, currency: string): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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
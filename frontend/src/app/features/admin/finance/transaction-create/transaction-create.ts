import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminFinanceControllerApiService } from '../../../../core/api/api/adminFinanceController.service';

import { TransactionRequestDto } from '../../../../core/api/model/transactionRequest';
import type { TransactionCategoryResponseDto } from '../../../../core/api/model/transactionCategoryResponse';

type TransactionType = TransactionRequestDto.TypeEnum;
type PaymentMethod = TransactionRequestDto.PaymentMethodEnum;

type TransactionForm = FormGroup<{
  type: FormControl<TransactionType>;
  amount: FormControl<number | null>;
  transactionDate: FormControl<string>;
  categoryId: FormControl<string>;
  paymentMethod: FormControl<PaymentMethod>;
  notes: FormControl<string>;
}>;

@Component({
  selector: 'app-transaction-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCreate {
  private readonly router = inject(Router);
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  readonly TransactionRequestDto = TransactionRequestDto;

  readonly loadingCategories = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly categories = signal<TransactionCategoryResponseDto[]>([]);

  readonly form: TransactionForm = new FormGroup({
    type: new FormControl<TransactionType>(TransactionRequestDto.TypeEnum.Expense, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    transactionDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    paymentMethod: new FormControl<PaymentMethod>(TransactionRequestDto.PaymentMethodEnum.Cash, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl('', {
      nonNullable: true,
    }),
  });

  readonly selectedType = signal<TransactionType>(TransactionRequestDto.TypeEnum.Expense);

  readonly pageTitle = computed(() =>
    this.selectedType() === TransactionRequestDto.TypeEnum.Income
      ? 'Add Income Transaction'
      : 'Add Expense Transaction',
  );

  constructor() {
    this.loadCategories(this.selectedType());

    this.form.controls.type.valueChanges.subscribe((type) => {
      this.selectedType.set(type);
      this.form.controls.categoryId.setValue('');
      this.loadCategories(type);
    });
  }

  loadCategories(type: TransactionType): void {
    this.loadingCategories.set(true);
    this.error.set(null);

    this.financeApi
      .activeCategoriesByType(type)
      .pipe(finalize(() => this.loadingCategories.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load transaction categories.');
            return;
          }

          this.categories.set(response.data);

          if (response.data.length === 1) {
            this.form.controls.categoryId.setValue(response.data[0].id ?? '');
          }
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: TransactionRequestDto = {
      type: value.type,
      amount: value.amount ?? 0,
      transactionDate: value.transactionDate,
      categoryId: value.categoryId,
      paymentMethod: value.paymentMethod,
      notes: value.notes.trim() || undefined,
    };

    this.saving.set(true);

    this.financeApi
      .createTransaction(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to create transaction.');
            return;
          }

          toast.success(response.message ?? 'Transaction created successfully.');
          void this.router.navigateByUrl('/admin/transactions');
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  cancel(): void {
    void this.router.navigateByUrl('/admin/transactions');
  }

  fieldError(controlName: keyof TransactionForm['controls']): string | null {
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

  moneyPreview(): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.form.controls.amount.value ?? 0);
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
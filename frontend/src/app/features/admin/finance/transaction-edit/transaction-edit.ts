import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminFinanceControllerApiService } from '../../../../core/api/api/adminFinanceController.service';

import { TransactionRequestDto } from '../../../../core/api/model/transactionRequest';
import type { TransactionResponseDto } from '../../../../core/api/model/transactionResponse';
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
  selector: 'app-transaction-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionEdit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  readonly TransactionRequestDto = TransactionRequestDto;

  readonly transactionId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly transaction = signal<TransactionResponseDto | null>(null);
  readonly categories = signal<TransactionCategoryResponseDto[]>([]);

  readonly loading = signal(false);
  readonly loadingCategories = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form: TransactionForm = new FormGroup({
    type: new FormControl<TransactionRequestDto.TypeEnum>(TransactionRequestDto.TypeEnum.Expense, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    transactionDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    paymentMethod: new FormControl<TransactionRequestDto.PaymentMethodEnum>(
      TransactionRequestDto.PaymentMethodEnum.Cash,
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    notes: new FormControl('', {
      nonNullable: true,
    }),
  });

  readonly selectedType = signal<TransactionType>(TransactionRequestDto.TypeEnum.Expense);

  readonly pageTitle = computed(() =>
    this.selectedType() === TransactionRequestDto.TypeEnum.Income
      ? 'Edit Income Transaction'
      : 'Edit Expense Transaction',
  );

  constructor() {
    if (!this.transactionId()) {
      void this.router.navigateByUrl('/admin/transactions');
      return;
    }

    this.loadTransaction();

    this.form.controls.type.valueChanges.subscribe((type) => {
      this.selectedType.set(type);
      this.form.controls.categoryId.setValue('');
      this.loadCategories(type);
    });
  }

  loadTransaction(): void {
    const id = this.transactionId();

    if (!id) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.financeApi
      .transaction(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load transaction.');
            return;
          }

          if (response.data.payrollRecordId) {
            this.error.set('Payroll-linked transactions must be edited through payroll records.');
            return;
          }

          this.transaction.set(response.data);
          this.patchForm(response.data);
          this.loadCategories(this.form.controls.type.value);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  loadCategories(type: TransactionType): void {
    this.loadingCategories.set(true);

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

          const currentCategoryId = this.transaction()?.categoryId;
          const categoryStillExists = response.data.some((category) => category.id === currentCategoryId);

          if (categoryStillExists && currentCategoryId) {
            this.form.controls.categoryId.setValue(currentCategoryId);
          }
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  submit(): void {
    const id = this.transactionId();

    if (!id || this.form.invalid || this.saving()) {
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
      .updateTransaction(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to update transaction.');
            return;
          }

          toast.success(response.message ?? 'Transaction updated successfully.');
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

  private patchForm(transaction: TransactionResponseDto): void {
    const type = this.resolveType(transaction.type);
    const paymentMethod = this.resolvePaymentMethod(transaction.paymentMethod);

    this.selectedType.set(type);

    this.form.patchValue({
      type,
      amount: transaction.amount ?? null,
      transactionDate: transaction.transactionDate ?? '',
      categoryId: transaction.categoryId ?? '',
      paymentMethod,
      notes: transaction.notes ?? '',
    });
  }

  private resolveType(value?: string): TransactionType {
    const values = Object.values(TransactionRequestDto.TypeEnum);

    if (value && values.includes(value as TransactionType)) {
      return value as TransactionType;
    }

    return TransactionRequestDto.TypeEnum.Expense;
  }

  private resolvePaymentMethod(value?: string): PaymentMethod {
    const values = Object.values(TransactionRequestDto.PaymentMethodEnum);

    if (value && values.includes(value as PaymentMethod)) {
      return value as PaymentMethod;
    }

    return TransactionRequestDto.PaymentMethodEnum.Cash;
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
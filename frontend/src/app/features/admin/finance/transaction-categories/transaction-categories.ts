import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminFinanceControllerApiService } from '../../../../core/api/api/adminFinanceController.service';

import { TransactionCategoryRequestDto } from '../../../../core/api/model/transactionCategoryRequest';
import type { TransactionCategoryResponseDto } from '../../../../core/api/model/transactionCategoryResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

type TransactionCategoryType = TransactionCategoryRequestDto.TypeEnum;

type CategoryForm = FormGroup<{
  type: FormControl<TransactionCategoryType>;
  name: FormControl<string>;
  systemKey: FormControl<string>;
  active: FormControl<boolean>;
  displayOrder: FormControl<number | null>;
}>;

@Component({
  selector: 'app-transaction-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCategories {
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  readonly TransactionCategoryRequestDto = TransactionCategoryRequestDto;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly categories = signal<TransactionCategoryResponseDto[]>([]);
  readonly editingCategory = signal<TransactionCategoryResponseDto | null>(null);
  readonly categoryToDelete = signal<TransactionCategoryResponseDto | null>(null);
  readonly deleteDialogOpen = signal(false);

  readonly page = signal(0);
  readonly size = signal(50);
  readonly totalElements = signal(0);

  readonly form: CategoryForm = new FormGroup({
    type: new FormControl<TransactionCategoryRequestDto.TypeEnum>(
      TransactionCategoryRequestDto.TypeEnum.Expense,
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    systemKey: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),
    active: new FormControl(true, {
      nonNullable: true,
    }),
    displayOrder: new FormControl<number | null>(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: this.page(),
      size: this.size(),
      sort: ['displayOrder,asc'],
    };

    this.financeApi
      .categories(pageable)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load transaction categories.');
            return;
          }

          this.categories.set(response.data.content ?? []);
          this.page.set(response.data.page ?? 0);
          this.size.set(response.data.size ?? 50);
          this.totalElements.set(response.data.totalElements ?? 0);
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

    const request: TransactionCategoryRequestDto = {
      type: value.type,
      name: value.name.trim(),
      systemKey: value.systemKey.trim() || undefined,
      active: value.active,
      displayOrder: value.displayOrder ?? 0,
    };

    const editing = this.editingCategory();

    this.saving.set(true);

    const request$ = editing?.id
      ? this.financeApi.updateCategory(editing.id, request)
      : this.financeApi.createCategory(request);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          toast.error(response.message ?? 'Unable to save category.');
          return;
        }

        toast.success(editing ? 'Category updated successfully.' : 'Category created successfully.');
        this.resetForm();
        this.loadCategories();
      },
      error: (error: unknown) => {
        this.applyApiErrors(error);
        toast.error(this.errorMessage(error));
      },
    });
  }

  editCategory(category: TransactionCategoryResponseDto): void {
    this.editingCategory.set(category);

    this.form.patchValue({
      type: this.resolveType(category.type),
      name: category.name ?? '',
      systemKey: category.systemKey ?? '',
      active: category.active ?? true,
      displayOrder: category.displayOrder ?? 0,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  askDelete(category: TransactionCategoryResponseDto): void {
    this.categoryToDelete.set(category);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    if (this.deleting()) {
      return;
    }

    this.categoryToDelete.set(null);
    this.deleteDialogOpen.set(false);
  }

  confirmDeleteCategory(): void {
    const category = this.categoryToDelete();

    if (!category?.id || this.deleting()) {
      return;
    }

    this.deleting.set(category.id);

    this.financeApi.deleteCategory(category.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.deleteDialogOpen.set(false);
        this.categoryToDelete.set(null);
        toast.success('Category deleted successfully.');
        this.loadCategories();
      },
      error: (error: unknown) => {
        this.deleting.set(null);
        toast.error(this.errorMessage(error));
      },
    });
  }

  resetForm(): void {
    this.editingCategory.set(null);

    this.form.reset({
      type: TransactionCategoryRequestDto.TypeEnum.Expense,
      name: '',
      systemKey: '',
      active: true,
      displayOrder: 0,
    });
  }

  fieldError(controlName: keyof CategoryForm['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['maxlength']) {
      return 'This value is too long.';
    }

    if (control.errors['min']) {
      return 'Value cannot be negative.';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    return 'Invalid value.';
  }

  typeBadgeClass(type?: string): string {
    if (type === TransactionCategoryRequestDto.TypeEnum.Income) {
      return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
  }

  activeBadgeClass(active?: boolean): string {
    if (active) {
      return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  private resolveType(value?: string): TransactionCategoryType {
    const values = Object.values(TransactionCategoryRequestDto.TypeEnum);

    if (value && values.includes(value as TransactionCategoryType)) {
      return value as TransactionCategoryType;
    }

    return TransactionCategoryRequestDto.TypeEnum.Expense;
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
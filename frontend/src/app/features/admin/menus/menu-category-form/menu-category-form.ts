import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminMenuControllerApiService } from '../../../../core/api/api/adminMenuController.service';

import { CategoryRequestDto } from '../../../../core/api/model/categoryRequest';
import type { AdminCategoryResponseDto } from '../../../../core/api/model/adminCategoryResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

type CategoryForm = FormGroup<{
  nameEn: FormControl<string>;
  nameRo: FormControl<string>;
  displayOrder: FormControl<number | null>;
  markAsNew: FormControl<boolean>;
  active: FormControl<boolean>;
}>;

@Component({
  selector: 'app-menu-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-category-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCategoryForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly menuApi = inject(AdminMenuControllerApiService);

  readonly categoryId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly category = signal<AdminCategoryResponseDto | null>(null);
  readonly loading = signal(!!this.categoryId());
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form: CategoryForm = new FormGroup({
    nameEn: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    nameRo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    displayOrder: new FormControl<number | null>(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    markAsNew: new FormControl(false, {
      nonNullable: true,
    }),
    active: new FormControl(true, {
      nonNullable: true,
    }),
  });

  constructor() {
    this.loadCategory();
  }

  loadCategory(): void {
    const id = this.categoryId();

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: 0,
      size: 100,
      sort: ['displayOrder,asc'],
    };

    this.menuApi
      .categories1(pageable)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load category.');
            return;
          }

          const category = response.data.content?.find((item) => item.id === id) ?? null;

          if (!category) {
            this.error.set('Unable to find the requested category.');
            return;
          }

          this.category.set(category);
          this.patchForm(category);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.saving()) {
      return;
    }

    const value = this.form.getRawValue();
    const request: CategoryRequestDto = {
      nameEn: value.nameEn.trim(),
      nameRo: value.nameRo.trim(),
      displayOrder: value.displayOrder ?? 0,
      markAsNew: value.markAsNew,
      active: value.active,
    };

    const id = this.categoryId();
    this.saving.set(true);

    const request$ = id ? this.menuApi.updateCategory1(id, request) : this.menuApi.createCategory1(request);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to save category.');
            return;
          }

          toast.success(response.message ?? (id ? 'Category updated.' : 'Category created.'));
          void this.router.navigateByUrl('/admin/menu/categories');
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  cancel(): void {
    void this.router.navigateByUrl('/admin/menu/categories');
  }

  fieldError(controlName: keyof CategoryForm['controls']): string | null {
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

    if (control.errors['maxlength']) {
      return 'Value is too long.';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    return 'Invalid value.';
  }

  private patchForm(category: AdminCategoryResponseDto): void {
    this.form.patchValue({
      nameEn: category.nameEn ?? '',
      nameRo: category.nameRo ?? '',
      displayOrder: category.displayOrder ?? 0,
      markAsNew: category.markAsNew ?? false,
      active: category.active ?? true,
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
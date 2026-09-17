import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminMenuControllerApiService } from '../../../core/api/api/adminMenuController.service';

import { CategoryRequestDto } from '../../../core/api/model/categoryRequest';
import { MenuItemRequestDto } from '../../../core/api/model/menuItemRequest';

import type { AdminCategoryResponseDto } from '../../../core/api/model/adminCategoryResponse';
import type { AdminMenuItemResponseDto } from '../../../core/api/model/adminMenuItemResponse';
import type { AdminMediaAssetResponseDto } from '../../../core/api/model/adminMediaAssetResponse';
import type { PageableDto } from '../../../core/api/model/pageable';

type CategoryForm = FormGroup<{
  name: FormControl<string>;
  displayOrder: FormControl<number | null>;
  markAsNew: FormControl<boolean>;
  active: FormControl<boolean>;
}>;

type MenuItemForm = FormGroup<{
  categoryId: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  price: FormControl<number | null>;
  weightLabel: FormControl<string>;
  displayOrder: FormControl<number | null>;
  markAsNew: FormControl<boolean>;
  popular: FormControl<boolean>;
  active: FormControl<boolean>;
}>;

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCategories {
  private readonly menuApi = inject(AdminMenuControllerApiService);

  readonly categories = signal<AdminCategoryResponseDto[]>([]);
  readonly menuItems = signal<AdminMenuItemResponseDto[]>([]);
  readonly loading = signal(false);
  readonly loadingItems = signal(false);
  readonly saving = signal(false);
  readonly savingItem = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly categoryFormOpen = signal(false);
  readonly itemFormOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly deleteItemDialogOpen = signal(false);
  readonly editingCategory = signal<AdminCategoryResponseDto | null>(null);
  readonly editingItem = signal<AdminMenuItemResponseDto | null>(null);
  readonly categoryToDelete = signal<AdminCategoryResponseDto | null>(null);
  readonly itemToDelete = signal<AdminMenuItemResponseDto | null>(null);
  readonly expandedCategoryIds = signal<Set<string>>(new Set());
  readonly totalElements = signal(0);

  readonly categoryForm: CategoryForm = new FormGroup({
    name: new FormControl('', {
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

  readonly itemForm: MenuItemForm = new FormGroup({
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(180)],
    }),
    description: new FormControl('', {
      nonNullable: true,
    }),
    price: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    weightLabel: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(50)],
    }),
    displayOrder: new FormControl<number | null>(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    markAsNew: new FormControl(false, {
      nonNullable: true,
    }),
    popular: new FormControl(false, {
      nonNullable: true,
    }),
    active: new FormControl(true, {
      nonNullable: true,
    }),
  });

  constructor() {
    this.loadCategories();
    this.loadMenuItemsForAccordion();
  }

  loadCategories(): void {
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
            this.error.set(response.message ?? 'Unable to load menu categories.');
            return;
          }

          this.categories.set(response.data.content ?? []);
          this.totalElements.set(response.data.totalElements ?? 0);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  loadMenuItemsForAccordion(): void {
    this.loadingItems.set(true);

    const pageable: PageableDto = {
      page: 0,
      size: 200,
      sort: ['displayOrder,asc'],
    };

    this.menuApi
      .menuItems(pageable)
      .pipe(finalize(() => this.loadingItems.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load menu items.');
            this.menuItems.set([]);
            return;
          }

          this.menuItems.set(response.data.content ?? []);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  reloadData(): void {
    this.loadCategories();
    this.loadMenuItemsForAccordion();
  }

  openCreateCategory(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({
      name: '',
      displayOrder: this.categories().length,
      markAsNew: false,
      active: true,
    });
    this.categoryFormOpen.set(true);
  }

  openEditCategory(category: AdminCategoryResponseDto, event?: Event): void {
    event?.stopPropagation();

    this.editingCategory.set(category);
    this.categoryForm.reset({
      name: category.name ?? '',
      displayOrder: category.displayOrder ?? 0,
      markAsNew: category.markAsNew ?? false,
      active: category.active ?? true,
    });
    this.categoryFormOpen.set(true);
  }

  closeCategoryForm(): void {
    if (this.saving()) return;

    this.categoryFormOpen.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset({
      name: '',
      displayOrder: 0,
      markAsNew: false,
      active: true,
    });
  }

  submitCategory(): void {
    this.categoryForm.markAllAsTouched();

    if (this.categoryForm.invalid || this.saving()) return;

    const value = this.categoryForm.getRawValue();
    const request: CategoryRequestDto = {
      name: value.name.trim(),
      displayOrder: value.displayOrder ?? 0,
      markAsNew: value.markAsNew,
      active: value.active,
    };

    const editingCategory = this.editingCategory();
    this.saving.set(true);

    const request$ = editingCategory?.id
      ? this.menuApi.updateCategory1(editingCategory.id, request)
      : this.menuApi.createCategory1(request);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to save category.');
            return;
          }

          toast.success(response.message ?? '');
          this.saving.set(false);
          this.closeCategoryForm();
          this.reloadData();
        },
        error: (error: unknown) => {
          this.applyApiErrors(error, this.categoryForm);
          toast.error(this.errorMessage(error));
        },
      });
  }

  openDeleteCategory(category: AdminCategoryResponseDto, event?: Event): void {
    event?.stopPropagation();

    this.categoryToDelete.set(category);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteCategory(): void {
    if (this.deleting()) return;

    this.categoryToDelete.set(null);
    this.deleteDialogOpen.set(false);
  }

  confirmDeleteCategory(): void {
    const category = this.categoryToDelete();

    if (!category?.id || this.deleting()) return;

    this.deleting.set(true);

    this.menuApi
      .deleteCategory1(category.id)
      .pipe(finalize(() => {
        this.deleting.set(false);
        this.closeDeleteCategory();
      }))
      .subscribe({
        next: () => {
          toast.success('Category deleted.');
          this.categories.update((items) => items.filter((item) => item.id !== category.id));
          this.menuItems.update((items) => items.filter((item) => item.categoryId !== category.id));
          this.expandedCategoryIds.update((ids) => {
            const next = new Set(ids);
            next.delete(category.id!);
            return next;
          });
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  toggleCategory(category: AdminCategoryResponseDto): void {
    if (!category.id) return;

    this.expandedCategoryIds.update((ids) => {
      const next = new Set(ids);

      if (next.has(category.id!)) {
        next.delete(category.id!);
      } else {
        next.add(category.id!);
      }

      return next;
    });
  }

  isExpanded(category: AdminCategoryResponseDto): boolean {
    return !!category.id && this.expandedCategoryIds().has(category.id);
  }

  categoryItems(categoryId?: string): AdminMenuItemResponseDto[] {
    if (!categoryId) return [];

    return this.menuItems().filter((item) => item.categoryId === categoryId);
  }

  thumbnailImage(item: AdminMenuItemResponseDto): AdminMediaAssetResponseDto | null {
    const images = item.images ?? [];

    return images.find((image) => image.primary) ?? images[0] ?? null;
  }

  openCreateItemForCategory(category: AdminCategoryResponseDto, event?: Event): void {
    event?.stopPropagation();

    this.editingItem.set(null);
    this.itemForm.reset({
      categoryId: category.id ?? '',
      name: '',
      description: '',
      price: null,
      weightLabel: '',
      displayOrder: this.categoryItems(category.id).length,
      markAsNew: false,
      popular: false,
      active: true,
    });
    this.itemFormOpen.set(true);
  }

  openEditItem(item: AdminMenuItemResponseDto, event?: Event): void {
    event?.stopPropagation();

    this.editingItem.set(item);
    this.itemForm.reset({
      categoryId: item.categoryId ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price ?? null,
      weightLabel: item.weightLabel ?? '',
      displayOrder: item.displayOrder ?? 0,
      markAsNew: item.markAsNew ?? false,
      popular: item.popular ?? false,
      active: item.active ?? true,
    });
    this.itemFormOpen.set(true);
  }

  closeItemForm(): void {
    if (this.savingItem()) return;

    this.itemFormOpen.set(false);
    this.editingItem.set(null);
    this.itemForm.reset({
      categoryId: '',
      name: '',
      description: '',
      price: null,
      weightLabel: '',
      displayOrder: 0,
      markAsNew: false,
      popular: false,
      active: true,
    });
  }

  // ✅ Fixed: always close after create or edit — no image handoff here
  // Image management is done in the dedicated Menu Items page
  submitItem(): void {
    this.itemForm.markAllAsTouched();

    if (this.itemForm.invalid || this.savingItem()) return;

    const value = this.itemForm.getRawValue();
    const request: MenuItemRequestDto = {
      categoryId: value.categoryId,
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      price: value.price ?? 0,
      weightLabel: value.weightLabel.trim() || undefined,
      displayOrder: value.displayOrder ?? 0,
      markAsNew: value.markAsNew,
      popular: value.popular,
      active: value.active,
    };

    const editingItem = this.editingItem();
    this.savingItem.set(true);

    const request$ = editingItem?.id
      ? this.menuApi.updateMenuItem(editingItem.id, request)
      : this.menuApi.createMenuItem(request);

    request$
      .pipe(finalize(() => this.savingItem.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to save menu item.');
            return;
          }

          toast.success(response.message ?? '');
          this.savingItem.set(false);
          this.closeItemForm();
          this.reloadData();
        },
        error: (error: unknown) => {
          this.applyApiErrors(error, this.itemForm);
          toast.error(this.errorMessage(error));
        },
      });
  }

  openDeleteItem(item: AdminMenuItemResponseDto, event?: Event): void {
    event?.stopPropagation();

    this.itemToDelete.set(item);
    this.deleteItemDialogOpen.set(true);
  }

  closeDeleteItem(): void {
    if (this.deleting()) return;

    this.itemToDelete.set(null);
    this.deleteItemDialogOpen.set(false);
  }

  confirmDeleteItem(): void {
    const item = this.itemToDelete();

    if (!item?.id || this.deleting()) return;

    this.deleting.set(true);

    this.menuApi
      .deleteMenuItem(item.id)
      .pipe(finalize(() => {
        this.deleting.set(false);
        this.closeDeleteItem();
      }))
      .subscribe({
        next: () => {
          toast.success('Menu item deleted.');
          this.menuItems.update((items) => items.filter((current) => current.id !== item.id));
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  firstImage(item: AdminMenuItemResponseDto): string | null {
    const images = item.images ?? [];
    const image = images.find((current) => current.primary) ?? images[0] ?? null;

    return image?.secureUrl ?? null;
  }

  imageAlt(item: AdminMenuItemResponseDto): string {
    const images = item.images ?? [];
    const image = images.find((current) => current.primary) ?? images[0] ?? null;

    return image?.alt || item.name || 'Menu item image';
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  statusBadgeClass(active?: boolean): string {
    if (active) {
      return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  fieldError(form: FormGroup<any>, controlName: string): string | null {
    const control = form.get(controlName);

    if (!control || !control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['min']) return 'Value must be greater than zero.';
    if (control.errors['maxlength']) return 'This value is too long.';
    if (control.errors['server']) return control.errors['server'];

    return 'Invalid value.';
  }

  categoryFieldError(controlName: keyof CategoryForm['controls']): string | null {
    return this.fieldError(this.categoryForm, controlName);
  }

  itemFieldError(controlName: keyof MenuItemForm['controls']): string | null {
    return this.fieldError(this.itemForm, controlName);
  }

  value(value?: string | null): string {
    return value && value.trim().length > 0 ? value : '-';
  }

  private applyApiErrors(error: unknown, form: FormGroup<any>): void {
    if (!(error instanceof HttpErrorResponse)) return;

    const errors = error.error?.errors as Record<string, string> | undefined;

    if (!errors) return;

    Object.entries(errors).forEach(([field, message]) => {
      const control = form.get(field);

      if (control) {
        control.setErrors({ ...(control.errors ?? {}), server: message });
        control.markAsTouched();
      }
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed with status ${error.status}.`;
    }

    if (error instanceof Error) return error.message;

    return 'Unexpected error.';
  }
}
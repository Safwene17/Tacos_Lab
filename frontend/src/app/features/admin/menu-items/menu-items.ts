import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminMenuControllerApiService } from '../../../core/api/api/adminMenuController.service';

import { MenuItemRequestDto } from '../../../core/api/model/menuItemRequest';

import type { AdminCategoryResponseDto } from '../../../core/api/model/adminCategoryResponse';
import type { AdminMenuItemResponseDto } from '../../../core/api/model/adminMenuItemResponse';
import type { AdminMediaAssetResponseDto } from '../../../core/api/model/adminMediaAssetResponse';
import type { PageableDto } from '../../../core/api/model/pageable';

type MenuItemForm = FormGroup<{
  categoryId: FormControl<string>;
  nameEn: FormControl<string>;
  nameRo: FormControl<string>;
  descriptionEn: FormControl<string>;
  descriptionRo: FormControl<string>;
  price: FormControl<number | null>;
  weightLabel: FormControl<string>;
  displayOrder: FormControl<number | null>;
  markAsNew: FormControl<boolean>;
  popular: FormControl<boolean>;
  active: FormControl<boolean>;
}>;

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-items.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItems {
  private readonly menuApi = inject(AdminMenuControllerApiService);

  @ViewChild('imageFileInput') private imageFileInput?: ElementRef<HTMLInputElement>;

  readonly items = signal<AdminMenuItemResponseDto[]>([]);
  readonly categories = signal<AdminCategoryResponseDto[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly formOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly imageDeleteDialogOpen = signal(false);
  readonly editingItem = signal<AdminMenuItemResponseDto | null>(null);
  readonly itemToDelete = signal<AdminMenuItemResponseDto | null>(null);
  readonly imageToDelete = signal<AdminMediaAssetResponseDto | null>(null);
  readonly itemImages = signal<AdminMediaAssetResponseDto[]>([]);
  readonly imagePreview = signal<string | null>(null);
  readonly imageFile = signal<File | null>(null);
  readonly imageAltEn = signal('');
  readonly imageAltRo = signal('');
  readonly imagePrimary = signal(false);

  readonly categoryOptions = computed(() =>
    [...this.categories()].sort(
      (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
    ),
  );

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index),
  );

  readonly form: MenuItemForm = new FormGroup({
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nameEn: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(180)],
    }),
    nameRo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(180)],
    }),
    descriptionEn: new FormControl('', {
      nonNullable: true,
    }),
    descriptionRo: new FormControl('', {
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
    this.loadItems();
  }

  loadCategories(): void {
    this.error.set(null);

    const pageable: PageableDto = {
      page: 0,
      size: 100,
      sort: ['displayOrder,asc'],
    };

    this.menuApi.categories1(pageable).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(response.message ?? 'Unable to load menu categories.');
          this.categories.set([]);
          return;
        }

        this.categories.set(response.data.content ?? []);
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
      },
    });
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: this.page(),
      size: 20,
      sort: ['displayOrder,asc'],
    };

    this.menuApi
      .menuItems(pageable)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load menu items.');
            this.items.set([]);
            return;
          }

          this.items.set(response.data.content ?? []);
          this.page.set(response.data.page ?? 0);
          this.totalPages.set(response.data.totalPages ?? 0);
          this.totalElements.set(response.data.totalElements ?? 0);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  reloadData(): void {
    this.loadCategories();
    this.loadItems();
  }

  openCreateForm(): void {
    this.editingItem.set(null);
    this.itemImages.set([]);
    this.clearImageDraft();

    this.form.reset({
      categoryId: '',
      nameEn: '',
      nameRo: '',
      descriptionEn: '',
      descriptionRo: '',
      price: null,
      weightLabel: '',
      displayOrder: this.items().length,
      markAsNew: false,
      popular: false,
      active: true,
    });

    this.formOpen.set(true);
  }

  openEditForm(item: AdminMenuItemResponseDto): void {
    if (!item.id) {
      return;
    }

    this.editingItem.set(item);
    this.itemImages.set(item.images ?? []);
    this.clearImageDraft();

    this.form.reset({
      categoryId: item.categoryId ?? '',
      nameEn: item.nameEn ?? '',
      nameRo: item.nameRo ?? '',
      descriptionEn: item.descriptionEn ?? '',
      descriptionRo: item.descriptionRo ?? '',
      price: item.price ?? null,
      weightLabel: item.weightLabel ?? '',
      displayOrder: item.displayOrder ?? 0,
      markAsNew: item.markAsNew ?? false,
      popular: item.popular ?? false,
      active: item.active ?? true,
    });

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving() || this.uploading()) {
      return;
    }

    this.formOpen.set(false);
    this.editingItem.set(null);
    this.itemImages.set([]);
    this.clearImageDraft();

    this.form.reset({
      categoryId: '',
      nameEn: '',
      nameRo: '',
      descriptionEn: '',
      descriptionRo: '',
      price: null,
      weightLabel: '',
      displayOrder: 0,
      markAsNew: false,
      popular: false,
      active: true,
    });
  }

  submitForm(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: MenuItemRequestDto = {
      categoryId: value.categoryId,
      nameEn: value.nameEn.trim(),
      nameRo: value.nameRo.trim(),
      descriptionEn: value.descriptionEn.trim() || undefined,
      descriptionRo: value.descriptionRo.trim() || undefined,
      price: value.price ?? 0,
      weightLabel: value.weightLabel.trim() || undefined,
      displayOrder: value.displayOrder ?? 0,
      markAsNew: value.markAsNew,
      popular: value.popular,
      active: value.active,
    };

    const editingItem = this.editingItem();
    this.saving.set(true);

    const request$ = editingItem?.id
      ? this.menuApi.updateMenuItem(editingItem.id, request)
      : this.menuApi.createMenuItem(request);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to save menu item.');
            toast.error(response.message ?? 'Unable to save menu item.');
            return;
          }

          toast.success(response.message ?? (editingItem?.id ? 'Menu item updated.' : 'Menu item created.'));

          this.saving.set(false);
          this.closeForm();
          this.loadItems();
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  askDelete(item: AdminMenuItemResponseDto): void {
    this.itemToDelete.set(item);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    if (this.deleting()) {
      return;
    }

    this.itemToDelete.set(null);
    this.deleteDialogOpen.set(false);
  }

  confirmDeleteItem(): void {
    const item = this.itemToDelete();

    if (!item?.id || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.menuApi
      .deleteMenuItem(item.id)
      .pipe(finalize(() => {
        this.deleting.set(false);
        this.closeDeleteDialog();
      }))
      .subscribe({
        next: () => {
          this.items.update((current) => current.filter((currentItem) => currentItem.id !== item.id));
          toast.success('Menu item deleted.');
          this.loadItems();
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  primaryImage(item: AdminMenuItemResponseDto): AdminMediaAssetResponseDto | null {
    const images = item.images ?? [];

    return images.find((image) => image.primary) ?? images[0] ?? null;
  }

  categoryName(item: AdminMenuItemResponseDto): string {
    return item.categoryNameEn || this.categoryOptions().find((category) => category.id === item.categoryId)?.nameEn || '-';
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

  badgeClass(kind: 'new' | 'popular'): string {
    if (kind === 'new') {
      return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400';
    }

    return 'bg-admin-brand-50 text-admin-brand-700 dark:bg-admin-brand-500/15 dark:text-admin-brand-500';
  }

  fieldError(controlName: keyof MenuItemForm['controls']): string | null {
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.clearImageDraft();

    if (!file) {
      return;
    }

    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
    this.imageAltEn.set('');
    this.imageAltRo.set('');
    this.imagePrimary.set(false);
  }

  uploadSelectedImage(): void {
    const itemId = this.editingItem()?.id;
    const file = this.imageFile();

    if (!itemId || !file || this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.menuApi
      .uploadImage(itemId, file, this.imageAltEn().trim() || undefined, this.imageAltRo().trim() || undefined, this.imagePrimary())
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to upload image.');
            toast.error(response.message ?? 'Unable to upload image.');
            return;
          }

          this.replaceItemImages(itemId, response.data, true);
          toast.success(response.message ?? '');
          this.clearImageDraft();
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  askDeleteImage(image: AdminMediaAssetResponseDto): void {
    this.imageToDelete.set(image);
    this.imageDeleteDialogOpen.set(true);
  }

  closeImageDeleteDialog(): void {
    if (this.deleting()) {
      return;
    }

    this.imageToDelete.set(null);
    this.imageDeleteDialogOpen.set(false);
  }

  confirmDeleteImage(): void {
    const itemId = this.editingItem()?.id;
    const image = this.imageToDelete();

    if (!itemId || !image?.id || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.menuApi
      .deleteImage(itemId, image.id)
      .pipe(finalize(() => {
        this.deleting.set(false);
        this.closeImageDeleteDialog();
      }))
      .subscribe({
        next: () => {
          const nextImages = this.itemImages().filter((current) => current.id !== image.id);
          this.itemImages.set(nextImages);
          this.editingItem.update((current) => (current ? { ...current, images: nextImages } : current));
          toast.success('Image deleted.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  setPrimaryImage(image: AdminMediaAssetResponseDto): void {
    const itemId = this.editingItem()?.id;

    if (!itemId || !image.id || image.primary || this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.menuApi
      .setPrimaryImage(itemId, image.id)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to update primary image.');
            toast.error(response.message ?? 'Unable to update primary image.');
            return;
          }

          const nextImages = this.itemImages().map((current) => ({
            ...current,
            primary: current.id === image.id,
          }));

          this.itemImages.set(nextImages);
          this.editingItem.update((current) => (current ? { ...current, images: nextImages } : current));
          toast.success(response.message ?? '');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  private replaceItemImages(itemId: string, image: AdminMediaAssetResponseDto, makePrimary: boolean): void {
    const nextImages = makePrimary
      ? [
          {
            ...image,
            primary: true,
          },
          ...this.itemImages().filter((current) => current.id !== image.id).map((current) => ({
            ...current,
            primary: false,
          })),
        ]
      : [...this.itemImages(), image];

    this.itemImages.set(nextImages);
    this.editingItem.update((current) => (current && current.id === itemId ? { ...current, images: nextImages } : current));
  }

  clearImageDraft(): void {
    const preview = this.imagePreview();

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageAltEn.set('');
    this.imageAltRo.set('');
    this.imagePrimary.set(false);

    if (this.imageFileInput) {
      this.imageFileInput.nativeElement.value = '';
    }
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.page()) {
      return;
    }

    this.page.set(page);
    this.loadItems();
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
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

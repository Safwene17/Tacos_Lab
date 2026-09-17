import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminMenuControllerApiService } from '../../../../core/api/api/adminMenuController.service';
import { IngredientChips } from '../../../../shared/components/ingredient-chips/ingredient-chips';

import { MenuItemRequestDto } from '../../../../core/api/model/menuItemRequest';
import { MediaAssetUpdateRequestDto } from '../../../../core/api/model/mediaAssetUpdateRequest';

import type { AdminCategoryResponseDto } from '../../../../core/api/model/adminCategoryResponse';
import type { AdminMenuItemResponseDto } from '../../../../core/api/model/adminMenuItemResponse';
import type { AdminMediaAssetResponseDto } from '../../../../core/api/model/adminMediaAssetResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

type MenuItemFormGroup = FormGroup<{
  categoryId: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  ingredients: FormControl<string[]>;
  price: FormControl<number | null>;
  weightLabel: FormControl<string>;
  displayOrder: FormControl<number | null>;
  markAsNew: FormControl<boolean>;
  popular: FormControl<boolean>;
  active: FormControl<boolean>;
}>;

@Component({
  selector: 'app-menu-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, IngredientChips],
  templateUrl: './menu-item-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly menuApi = inject(AdminMenuControllerApiService);

  @ViewChild('imageFileInput') private imageFileInput?: ElementRef<HTMLInputElement>;

  readonly categories = signal<AdminCategoryResponseDto[]>([]);
  readonly menuItems = signal<AdminMenuItemResponseDto[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingItemId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly editingItem = signal<AdminMenuItemResponseDto | null>(null);
  readonly itemImages = signal<AdminMediaAssetResponseDto[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly filePreviewUrl = signal<string | null>(null);
  readonly fileAlt = signal('');
  readonly filePrimary = signal(false);
  readonly imageDeleteDialogOpen = signal(false);
  readonly imageToDelete = signal<AdminMediaAssetResponseDto | null>(null);
  readonly editingImageId = signal<string | null>(null);
  readonly editingImageAlt = signal('');
  readonly editingImageDisplayOrder = signal(0);
  readonly editingImagePrimary = signal(false);

  readonly hasId = computed(() => this.editingItemId() !== null);
  readonly categoryOptions = computed(() =>
    [...this.categories()].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0)),
  );

  readonly form = new FormGroup({
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
    ingredients: new FormControl<string[]>([], {
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

    const id = this.editingItemId();

    if (id) {
      this.loadMenuItem(id);
    } else {
      const categoryId = this.route.snapshot.queryParamMap.get('categoryId');

      if (categoryId) {
        this.form.controls.categoryId.setValue(categoryId);
      }
    }
  }

  loadCategories(): void {
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

  loadMenuItem(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: 0,
      size: 1000,
      sort: ['displayOrder,asc'],
    };

    this.menuApi
      .menuItems(pageable)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load menu item.');
            return;
          }

          this.menuItems.set(response.data.content ?? []);

          const item = response.data.content?.find((current) => current.id === id) ?? null;

          if (!item) {
            this.error.set('Unable to find the requested menu item.');
            return;
          }

          this.editingItem.set(item);
          this.editingItemId.set(item.id ?? id);
          this.itemImages.set(item.images ?? []);
          this.patchForm(item);
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

    const request = this.buildRequest();
    const id = this.editingItemId();

    if (id) {
      this.saving.set(true);

      this.menuApi
        .updateMenuItem(id, request)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: (response) => {
            if (!response.success || !response.data) {
              toast.error(response.message ?? 'Unable to update menu item.');
              return;
            }

            toast.success(response.message ?? 'Menu item updated.');
            this.resetEditorState();
            void this.router.navigateByUrl('/admin/menu/items');
          },
          error: (error: unknown) => {
            this.applyApiErrors(error);
            toast.error(this.errorMessage(error));
          },
        });

      return;
    }

    this.saving.set(true);

    this.menuApi
      .createMenuItem(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data?.id) {
            toast.error(response.message ?? 'Unable to create menu item.');
            return;
          }

          toast.success(response.message ?? 'Menu item created.');
          this.editingItemId.set(response.data.id ?? null);
          this.editingItem.set(response.data);
          this.itemImages.set(response.data.images ?? []);
          this.patchForm(response.data);
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  cancel(): void {
    void this.router.navigateByUrl('/admin/menu/items');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.clearFileSelection();

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }

    this.selectedFile.set(file);
    this.filePreviewUrl.set(URL.createObjectURL(file));
    this.fileAlt.set('');
    this.filePrimary.set(false);
  }

  uploadImage(): void {
    const itemId = this.editingItemId();
    const file = this.selectedFile();

    if (!itemId || !file || this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.menuApi
      .uploadImage(itemId, file, this.fileAlt().trim() || undefined, this.filePrimary())
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to upload image.');
            return;
          }

          this.appendImage(response.data, this.filePrimary());
          this.clearFileSelection();
          toast.success(response.message ?? 'Image uploaded.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  startEditImage(image: AdminMediaAssetResponseDto): void {
    this.editingImageId.set(image.id ?? null);
    this.editingImageAlt.set(image.alt ?? '');
    this.editingImageDisplayOrder.set(image.displayOrder ?? 0);
    this.editingImagePrimary.set(image.primary ?? false);
  }

  cancelEditImage(): void {
    this.editingImageId.set(null);
    this.editingImageAlt.set('');
    this.editingImageDisplayOrder.set(0);
    this.editingImagePrimary.set(false);
  }

  saveImageEdit(image: AdminMediaAssetResponseDto): void {
    const itemId = this.editingItemId();

    if (!itemId || !image.id || this.uploading()) {
      return;
    }

    const request: MediaAssetUpdateRequestDto = {
      alt: this.editingImageAlt().trim() || undefined,
      primary: this.editingImagePrimary(),
      displayOrder: this.editingImageDisplayOrder(),
    };

    this.uploading.set(true);

    this.menuApi
      .updateImage(itemId, image.id, request)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Unable to update image.');
            return;
          }

          this.updateImageInList(response.data);
          this.cancelEditImage();
          toast.success(response.message ?? 'Image updated.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  updateEditingImageDisplayOrder(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.editingImageDisplayOrder.set(Number(input.value || 0));
  }

  askDeleteImage(image: AdminMediaAssetResponseDto): void {
    this.imageToDelete.set(image);
    this.imageDeleteDialogOpen.set(true);
  }

  closeImageDeleteDialog(): void {
    if (this.uploading()) {
      return;
    }

    this.imageToDelete.set(null);
    this.imageDeleteDialogOpen.set(false);
  }

  confirmDeleteImage(): void {
    const itemId = this.editingItemId();
    const image = this.imageToDelete();

    if (!itemId || !image?.id || this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.menuApi
      .deleteImage(itemId, image.id)
      .pipe(finalize(() => {
        this.uploading.set(false);
        this.closeImageDeleteDialog();
      }))
      .subscribe({
        next: () => {
          this.itemImages.update((items) => items.filter((current) => current.id !== image.id));
          toast.success('Image deleted.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  setPrimaryImage(image: AdminMediaAssetResponseDto): void {
    const itemId = this.editingItemId();

    if (!itemId || !image.id || image.primary || this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.menuApi
      .setPrimaryImage(itemId, image.id)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            toast.error(response.message ?? 'Unable to update primary image.');
            return;
          }

          this.itemImages.update((items) =>
            items.map((current) => ({
              ...current,
              primary: current.id === image.id,
            })),
          );
          toast.success(response.message ?? 'Primary image updated.');
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
    return item.categoryName || this.categoryOptions().find((category) => category.id === item.categoryId)?.name || '-';
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

  fieldError(controlName: keyof MenuItemFormGroup['controls']): string | null {
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

  clearFileSelection(): void {
    const preview = this.filePreviewUrl();

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    this.selectedFile.set(null);
    this.filePreviewUrl.set(null);
    this.fileAlt.set('');
    this.filePrimary.set(false);

    if (this.imageFileInput) {
      this.imageFileInput.nativeElement.value = '';
    }
  }

  private resetEditorState(): void {
    this.clearFileSelection();
    this.cancelEditImage();
    this.imageDeleteDialogOpen.set(false);
    this.imageToDelete.set(null);
    this.editingItem.set(null);
    this.itemImages.set([]);
  }

  private buildRequest(): MenuItemRequestDto {
    const value = this.form.getRawValue();

    return {
      categoryId: value.categoryId,
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      ingredients: value.ingredients || [],
      price: value.price ?? 0,
      weightLabel: value.weightLabel.trim() || undefined,
      displayOrder: value.displayOrder ?? 0,
      markAsNew: value.markAsNew,
      popular: value.popular,
      active: value.active,
    };
  }

  private patchForm(item: AdminMenuItemResponseDto): void {
    this.form.patchValue({
      categoryId: item.categoryId ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      ingredients: item.ingredients ?? [],
      price: item.price ?? null,
      weightLabel: item.weightLabel ?? '',
      displayOrder: item.displayOrder ?? 0,
      markAsNew: item.markAsNew ?? false,
      popular: item.popular ?? false,
      active: item.active ?? true,
    });
  }

  private appendImage(image: AdminMediaAssetResponseDto, makePrimary: boolean): void {
    const nextImages = makePrimary
      ? [
          {
            ...image,
            primary: true,
          },
          ...this.itemImages().map((current) => ({
            ...current,
            primary: false,
          })),
        ]
      : [...this.itemImages(), image];

    this.itemImages.set(nextImages);

    if (this.editingItem()) {
      this.editingItem.update((current) => (current ? { ...current, images: nextImages } : current));
    }
  }

  private updateImageInList(image: AdminMediaAssetResponseDto): void {
    this.itemImages.update((items) =>
      items.map((current) => (current.id === image.id ? { ...current, ...image } : current)),
    );

    if (image.primary) {
      this.itemImages.update((items) =>
        items.map((current) => ({
          ...current,
          primary: current.id === image.id,
        })),
      );
    }

    this.editingItem.update((current) =>
      current ? { ...current, images: this.itemImages() } : current,
    );
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
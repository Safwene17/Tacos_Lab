import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdminMenuControllerApiService } from '../../../../core/api/api/adminMenuController.service';

import type { AdminCategoryResponseDto } from '../../../../core/api/model/adminCategoryResponse';
import type { AdminMenuItemResponseDto } from '../../../../core/api/model/adminMenuItemResponse';
import type { AdminMediaAssetResponseDto } from '../../../../core/api/model/adminMediaAssetResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu-items.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItems {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuApi = inject(AdminMenuControllerApiService);

  readonly items = signal<AdminMenuItemResponseDto[]>([]);
  readonly categories = signal<AdminCategoryResponseDto[]>([]);
  readonly categoryId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly deleteDialogOpen = signal(false);
  readonly itemToDelete = signal<AdminMenuItemResponseDto | null>(null);

  readonly pages = signal<number[]>([]);
  readonly activeCategory = computed(() => {
    const categoryId = this.categoryId();

    if (!categoryId) {
      return null;
    }

    return this.categories().find((category) => category.id === categoryId) ?? null;
  });

  constructor() {
    this.loadCategories();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const nextCategoryId = params.get('categoryId');

      if (this.categoryId() !== nextCategoryId) {
        this.categoryId.set(nextCategoryId);
        this.page.set(0);
      }

      this.loadItems();
    });
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

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: this.page(),
      size: this.size(),
      sort: ['displayOrder,asc'],
    };

    const request = this.categoryId()
      ? this.menuApi.getMenuItemsByCategoryId(this.categoryId() as string, pageable)
      : this.menuApi.menuItems(pageable);

    request
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
          this.pages.set(Array.from({ length: response.data.totalPages ?? 0 }, (_, index) => index));
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

  clearFilter(): void {
    void this.router.navigate(['/admin/menu/items']);
  }

  primaryImage(item: AdminMenuItemResponseDto): AdminMediaAssetResponseDto | null {
    const images = item.images ?? [];

    return images.find((image) => image.primary) ?? images[0] ?? null;
  }

  categoryName(item: AdminMenuItemResponseDto): string {
    return item.categoryName || this.categories().find((category) => category.id === item.categoryId)?.name || '-';
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

  openDeleteItem(item: AdminMenuItemResponseDto): void {
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
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.closeDeleteDialog();
        }),
      )
      .subscribe({
        next: () => {
          this.items.update((current) => current.filter((currentItem) => currentItem.id !== item.id));
          this.totalElements.update((count) => Math.max(0, count - 1));
          toast.success('Menu item deleted.');
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
    this.loadItems();
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error.';
  }
}
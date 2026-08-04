import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AdminMenuControllerApiService } from '../../../../core/api/api/adminMenuController.service';

import type { AdminCategoryResponseDto } from '../../../../core/api/model/adminCategoryResponse';
import type { AdminMenuItemResponseDto } from '../../../../core/api/model/adminMenuItemResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCategories {
  private readonly router = inject(Router);
  private readonly menuApi = inject(AdminMenuControllerApiService);

  readonly categories = signal<AdminCategoryResponseDto[]>([]);
  readonly menuItems = signal<AdminMenuItemResponseDto[]>([]);
  readonly loading = signal(false);
  readonly loadingItems = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleteDialogOpen = signal(false);
  readonly categoryToDelete = signal<AdminCategoryResponseDto | null>(null);
  readonly totalElements = signal(0);

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();

    for (const item of this.menuItems()) {
      if (!item.categoryId) {
        continue;
      }

      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }

    return counts;
  });

  constructor() {
    this.loadCategories();
    this.loadMenuItems();
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

  loadMenuItems(): void {
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
    this.loadMenuItems();
  }

  categoryItemCount(categoryId?: string): number {
    if (!categoryId) {
      return 0;
    }

    return this.categoryCounts().get(categoryId) ?? 0;
  }

  statusBadgeClass(active?: boolean): string {
    if (active) {
      return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  viewItems(categoryId?: string): void {
    void this.router.navigate(['/admin/menu/items'], {
      queryParams: categoryId ? { categoryId } : {},
    });
  }

  openDeleteCategory(category: AdminCategoryResponseDto): void {
    this.categoryToDelete.set(category);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteCategory(): void {
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

    this.deleting.set(true);

    this.menuApi
      .deleteCategory1(category.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.closeDeleteCategory();
        }),
      )
      .subscribe({
        next: () => {
          this.categories.update((items) => items.filter((item) => item.id !== category.id));
          this.menuItems.update((items) => items.filter((item) => item.categoryId !== category.id));
          toast.success('Category deleted.');
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error.';
  }
}
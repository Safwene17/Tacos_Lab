import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PublicMenuControllerApiService } from '../../../core/api/api/publicMenuController.service';
import { ErrorHandlerService } from '../../../core/error/error-handler.service';


import type { PublicMediaAssetResponseDto } from '../../../core/api/model/publicMediaAssetResponse';
import type { PublicMenuCategoryGroupResponseDto } from '../../../core/api/model/publicMenuCategoryGroupResponse';
import type { PublicMenuItemResponseDto } from '../../../core/api/model/publicMenuItemResponse';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  private readonly router = inject(Router);

  private readonly publicMenuApi = inject(PublicMenuControllerApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly menuGroups = signal<PublicMenuCategoryGroupResponseDto[]>([]);
  readonly loadingMenu = signal(false);
  readonly menuError = signal<string | null>(null);
  readonly selectedCategoryId = signal<string | null>(null);

  readonly categories = computed(() =>
    [...this.menuGroups()]
      .map((group) => group.category)
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .sort((left, right) => {
        const leftOrder = left.displayOrder ?? 0;
        const rightOrder = right.displayOrder ?? 0;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return (left.name ?? '').localeCompare(right.name ?? '');
      }),
  );

  readonly allItems = computed(() => this.menuGroups().flatMap((group) => group.items ?? []));

  readonly filteredItems = computed(() => {
    const selected = this.selectedCategoryId();

    if (!selected) {
      return this.allItems();
    }

    return this.allItems().filter((item) => item.categoryId === selected);
  });

  constructor() {
    this.loadMenu();
  }

  loadMenu(): void {
    this.loadingMenu.set(true);
    this.menuError.set(null);

    const language = 'en';

    this.publicMenuApi
      .menu(language, language)
      .pipe(finalize(() => this.loadingMenu.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.menuError.set(response.message ?? 'Unable to load menu items.');
            this.menuGroups.set([]);
            return;
          }

          this.menuGroups.set(response.data.categories ?? []);
        },
        error: (error: unknown) => {
          const appError = this.errorHandler.parseError(error);
          this.menuError.set(appError.message);
        },
      });
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  viewProduct(item: PublicMenuItemResponseDto): void {
    if (!item.id) {
      return;
    }

    void this.router.navigate(['/menu/product', item.id]);
  }

  firstImage(item: PublicMenuItemResponseDto): PublicMediaAssetResponseDto | null {
    const images = item.images ?? [];

    return images.find((image) => image.primary) ?? images[0] ?? null;
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency ?? 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  retry(): void {
    this.loadMenu();
  }
}
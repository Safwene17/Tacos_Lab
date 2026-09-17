import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PublicMenuControllerApiService } from '../../../core/api/api/publicMenuController.service';

import { Footer } from '../../../shared/components/footer/footer';
import { Navbar } from '../../../shared/components/navbar/navbar';

import type { PublicMediaAssetResponseDto } from '../../../core/api/model/publicMediaAssetResponse';
import type { PublicMenuCategoryGroupResponseDto } from '../../../core/api/model/publicMenuCategoryGroupResponse';
import type { PublicMenuItemResponseDto } from '../../../core/api/model/publicMenuItemResponse';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [Navbar, Footer],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly publicMenuApi = inject(PublicMenuControllerApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly menuGroups = signal<PublicMenuCategoryGroupResponseDto[]>([]);
  readonly productId = signal<string | null>(null);
  readonly selectedImageId = signal<string | null>(null);

  readonly allItems = computed(() => this.menuGroups().flatMap((group) => group.items ?? []));
  readonly product = computed(() => {
    const productId = this.productId();

    if (!productId) {
      return null;
    }

    return this.allItems().find((item) => item.id === productId) ?? null;
  });

  readonly productGroup = computed(() => {
    const item = this.product();

    if (!item?.categoryId) {
      return null;
    }

    return this.menuGroups().find((group) => group.category?.id === item.categoryId) ?? null;
  });

  readonly orderedImages = computed(() => {
    const images = this.product()?.images ?? [];

    return [...images].sort((left, right) => {
      if (left.primary !== right.primary) {
        return left.primary ? -1 : 1;
      }

      return (left.displayOrder ?? 0) - (right.displayOrder ?? 0);
    });
  });

  readonly selectedImage = computed(() => {
    const selectedId = this.selectedImageId();
    const images = this.orderedImages();

    if (selectedId) {
      const image = images.find((item) => item.id === selectedId);

      if (image) {
        return image;
      }
    }

    return images[0] ?? null;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.productId.set(params.get('id'));
      this.loadMenu();
    });
  }

  loadMenu(): void {
    this.loading.set(true);
    this.error.set(null);

    const language = 'en';

    this.publicMenuApi
      .menu(language, language)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load menu.');
            this.menuGroups.set([]);
            return;
          }

          this.menuGroups.set(response.data.categories ?? []);

          const current = this.product();

          if (current?.images?.length) {
            const primaryImage = current.images.find((image) => image.primary) ?? current.images[0] ?? null;
            this.selectedImageId.set(primaryImage?.id ?? null);
          } else {
            this.selectedImageId.set(null);
          }
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  displayImage(item: PublicMenuItemResponseDto): PublicMediaAssetResponseDto | null {
    const images = item.images ?? [];

    return images.find((image) => image.primary) ?? images[0] ?? null;
  }

  selectImage(image: PublicMediaAssetResponseDto): void {
    this.selectedImageId.set(image.id ?? null);
  }

  backToMenu(): void {
    void this.router.navigate(['/'], { fragment: 'menu' });
  }

  retry(): void {
    this.loadMenu();
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency ?? 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  badgeClass(kind: 'popular' | 'new'): string {
    if (kind === 'popular') {
      return 'bg-yellow-400/15 text-yellow-300';
    }

    return 'bg-emerald-400/15 text-emerald-300';
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
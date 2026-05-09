import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { MenuCard } from '../../../shared/components/menu-card/menu-card';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { MENU_ITEMS, MENU_TABS, type MenuCategory } from '../data/menu.data';
import { I18n } from '../../../core/i18n/i18n';

type SelectedCategory = MenuCategory | 'all';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [SectionTitle, MenuCard, ScrollReveal],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  readonly i18n = inject(I18n);

  readonly tabs = MENU_TABS;
  readonly selectedCategory = signal<SelectedCategory>('all');

  readonly filteredItems = computed(() => {
    const selected = this.selectedCategory();

    return selected === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selected);
  });

  selectCategory(category: SelectedCategory): void {
    this.selectedCategory.set(category);
  }

  revealDelay(index: number): number {
    return index * 50;
  }
}
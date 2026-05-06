import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { MenuCard } from '../../../shared/components/menu-card/menu-card';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { MENU_ITEMS, MENU_TABS, type MenuCategory } from '../data/menu.data';

type SelectedCategory = MenuCategory | 'all';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [SectionTitle, MenuCard, ScrollReveal],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
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
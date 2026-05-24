import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminSidebarStore {
  readonly isExpanded = signal(true);
  readonly isHovered = signal(false);
  readonly isMobileOpen = signal(false);

  readonly isDesktopExpanded = computed(
    () => this.isExpanded() || this.isHovered(),
  );

  toggleSidebar(): void {
    this.isExpanded.update((value) => !value);
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen.update((value) => !value);
  }

  closeMobileSidebar(): void {
    this.isMobileOpen.set(false);
  }

  setHovered(value: boolean): void {
    this.isHovered.set(value);
  }
}
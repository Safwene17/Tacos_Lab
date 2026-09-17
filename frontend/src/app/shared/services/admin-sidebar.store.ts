import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminSidebarStore {
  readonly isExpanded = signal(true);
  readonly isHovered = signal(false);
  readonly isMobileOpen = signal(false);
  readonly isDesktopView = signal(window.innerWidth >= 1280); // xl breakpoint

  readonly isDesktopExpanded = computed(
    () => (this.isExpanded() || this.isHovered()) && this.isDesktopView(),
  );

  constructor() {
    // Listen to window resize to update desktop view state
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.isDesktopView.set(window.innerWidth >= 1280);
        // Close mobile sidebar when resizing to desktop
        if (this.isDesktopView()) {
          this.closeMobileSidebar();
        }
      });
    }
  }

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
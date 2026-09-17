import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type AdminTheme = 'light' | 'dark';

const STORAGE_KEY = 'tacos-lab-admin-theme';

@Injectable({
  providedIn: 'root',
})
export class AdminThemeStore {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<AdminTheme>(this.getInitialTheme());

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;

      root.classList.toggle('dark', theme === 'dark');

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    });
  }

  toggleTheme(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: AdminTheme): void {
    this.theme.set(theme);
  }

  private getInitialTheme(): AdminTheme {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
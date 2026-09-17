import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

import { AdminSidebarStore } from '../../../../shared/services/admin-sidebar.store';

interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  readonly sidebar = inject(AdminSidebarStore);

  readonly navItems: readonly AdminNavItem[] = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Menu Categories',
      path: '/admin/menu/categories',
      icon: 'menuCategories',
    },
    {
      label: 'Menu Items',
      path: '/admin/menu/items',
      icon: 'menuItems',
    },
    {
      label: 'Employees',
      path: '/admin/employees',
      icon: 'users',
    },
    {
      label: 'Settings',
      path: '/admin/settings',
      icon: 'settings',
    },
    {
      label: 'Transactions',
      path: '/admin/transactions',
      icon: 'wallet',
    },
    {
      label: 'Transaction Categories',
      path: '/admin/transaction-categories',
      icon: 'categories',
    }
  ];

  iconPath(icon: string): string {
    const icons: Record<string, string> = {
      dashboard:
        'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
      menu:
        'M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z',
      menuCategories:
        'M3 5h5v5H3V5zm8 0h5v5h-5V5zM3 13h5v5H3v-5zm8 0h5v5h-5v-5z',
      menuItems:
        'M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z',
      users:
        'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13Z',
      wallet:
        'M21 7H5c-.55 0-1-.45-1-1s.45-1 1-1h15V3H5C3.34 3 2 4.34 2 6v12c0 1.66 1.34 3 3 3h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2Zm-2 8c-.83 0-1.5-.67-1.5-1.5S18.17 12 19 12s1.5.67 1.5 1.5S19.83 15 19 15Z',
      settings:
        'M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1a7.03 7.03 0 0 0-1.69-.98L15 3h-4l-.36 2.93c-.6.23-1.17.54-1.69.98l-2.49-1-2 3.46 2.11 1.65c-.04.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65 2 3.46 2.49-1c.52.4 1.09.74 1.69.98L11 21h4l.36-2.93c.6-.23 1.17-.54 1.69-.98l2.49 1 2-3.46-2.11-1.65ZM13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5Z',
      categories:
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    };

    return icons[icon] ?? icons['dashboard'];
  }
}
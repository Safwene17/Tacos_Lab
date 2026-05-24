import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminSidebarStore } from '../../../../shared/services/admin-sidebar.store';
import { AdminThemeStore } from '../../../../shared/services/admin-theme.store';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AdminHeader } from '../admin-header/admin-header';
import { AdminBackdrop } from '../admin-backdrop/admin-backdrop';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [NgClass, RouterOutlet, AdminSidebar, AdminHeader, AdminBackdrop],
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  readonly sidebar = inject(AdminSidebarStore);

  /**
   * Injected once so the theme effect is initialized when admin layout loads.
   */
  readonly theme = inject(AdminThemeStore);
}
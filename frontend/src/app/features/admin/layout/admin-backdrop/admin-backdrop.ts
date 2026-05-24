import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AdminSidebarStore } from '../../../../shared/services/admin-sidebar.store';

@Component({
  selector: 'app-admin-backdrop',
  standalone: true,
  templateUrl: './admin-backdrop.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBackdrop {
  readonly sidebar = inject(AdminSidebarStore);
}
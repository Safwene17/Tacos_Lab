import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AuthControllerApiService } from '../../../../core/api/api/authController.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import { AdminSidebarStore } from '../../../../shared/services/admin-sidebar.store';
import { AdminThemeStore } from '../../../../shared/services/admin-theme.store';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeader {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthControllerApiService);

  readonly sidebar = inject(AdminSidebarStore);
  readonly theme = inject(AdminThemeStore);
  readonly authStore = inject(AuthStore);

  readonly userMenuOpen = signal(false);
  readonly loggingOut = signal(false);

  toggleUserMenu(): void {
    this.userMenuOpen.update((value) => !value);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);

    this.authApi.logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({
        next: () => {
          this.finishLogout();
        },
        error: () => {
          this.finishLogout();
        },
      });
  }

  private finishLogout(): void {
    this.authStore.clearAuth();
    this.closeUserMenu();
    toast.success('Signed out successfully.');
    void this.router.navigateByUrl('/login');
  }
}
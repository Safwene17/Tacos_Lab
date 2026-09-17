import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../../../core/auth/auth.store';

/**
 * Guard to ensure user can only access force-change-password page
 * if they are authenticated and mustChangePassword is true.
 */
export const forceChangePasswordGuard: CanActivateFn = (): boolean => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    void router.navigateByUrl('/login');
    return false;
  }

  if (!authStore.mustChangePassword()) {
    void router.navigateByUrl('/admin/dashboard');
    return false;
  }

  return true;
};

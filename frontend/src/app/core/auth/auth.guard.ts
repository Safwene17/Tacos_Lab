import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { AuthStore } from './auth.store';
import { AuthControllerApiService } from '../api/api/authController.service';

import type { ApiResponseAdminMeResponseDto } from '../api/model/apiResponseAdminMeResponse';
import type { ApiResponseAuthResponseDto } from '../api/model/apiResponseAuthResponse';

export const adminAuthGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const authStore = inject(AuthStore);
  const authApi = inject(AuthControllerApiService);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return restoreSession(authApi, authStore).pipe(
    map((restored) => {
      if (restored) {
        return true;
      }

      void router.navigateByUrl('/login');
      return false;
    }),
  );
};

export const guestOnlyGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const authStore = inject(AuthStore);
  const authApi = inject(AuthControllerApiService);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    void router.navigateByUrl('/admin/dashboard');
    return false;
  }

  return restoreSession(authApi, authStore).pipe(
    map((restored) => {
      if (restored) {
        void router.navigateByUrl('/admin/dashboard');
        return false;
      }

      return true;
    }),
  );
};

function restoreSession(
  authApi: AuthControllerApiService,
  authStore: AuthStore,
): Observable<boolean> {
  return authApi.refresh().pipe(
    switchMap((authResponse: ApiResponseAuthResponseDto) => {
      const accessToken = authResponse.data?.accessToken;

      if (!authResponse.success || !accessToken) {
        authStore.clearAuth();
        return of(false);
      }

      authStore.setAuth(
        accessToken,
        authResponse.data?.mustChangePassword ?? false,
      );

      return authApi.me().pipe(
        map((meResponse: ApiResponseAdminMeResponseDto) => {
          if (!meResponse.success || !meResponse.data) {
            authStore.clearAuth();
            return false;
          }

          authStore.setMe(meResponse.data);
          return true;
        }),
      );
    }),
    catchError(() => {
      authStore.clearAuth();
      return of(false);
    }),
  );
}
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthStore } from './auth.store';

/**
 * Interceptor that checks if the user must change their password.
 * If mustChangePassword is true and the user is trying to access admin routes,
 * they will be redirected to the force password change page.
 */
export const forceChangePasswordInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(request).pipe(
    tap((event) => {
      // Check if response contains mustChangePassword flag
      if (event instanceof HttpResponse && event.body) {
        const body = event.body as Record<string, unknown>;

        if (body['data'] && typeof body['data'] === 'object') {
          const data = body['data'] as Record<string, unknown>;

          if (data['mustChangePassword'] === true) {
            // Store the flag and redirect to force change password page if not already there
            const currentPath = router.routerState.root.component
              ? (router.routerState.root.component as any).name
              : '';

            if (!window.location.pathname.includes('/force-change-password')) {
              void router.navigateByUrl('/force-change-password');
            }
          }
        }
      }
    }),
  );
};

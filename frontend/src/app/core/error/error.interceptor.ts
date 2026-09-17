import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { ErrorHandlerService } from './error-handler.service';

/**
 * Global HTTP error interceptor that catches errors and displays them to users
 * Excludes certain endpoints from showing errors (e.g., some auth endpoints handle errors themselves)
 */
export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const errorHandler = inject(ErrorHandlerService);

  return next(request).pipe(
    catchError((error: unknown) => {
      // Skip error display for specific endpoints that handle errors themselves
      if (!shouldSuppressErrorNotification(request.url)) {
        const appError = errorHandler.parseError(error);

        // Show error toast to user
        toast.error(appError.message);
      }

      // Re-throw the error so it can be handled by component
      return throwError(() => error);
    }),
  );
};

/**
 * Determine if error notification should be suppressed for this endpoint
 * Some endpoints handle errors in their own components
 */
function shouldSuppressErrorNotification(url: string): boolean {
  const cleanUrl = normalizeUrl(url);

  // Suppress for login endpoint (login component handles its own errors)
  if (cleanUrl.endsWith('/api/auth/login')) {
    return true;
  }

  // Suppress for refresh endpoint (auth flow handles this)
  if (cleanUrl.endsWith('/api/auth/refresh')) {
    return true;
  }

  // Suppress for force-change-password (component handles errors)
  if (cleanUrl.endsWith('/api/auth/force-change-password')) {
    return true;
  }

  // Suppress for change-password (component handles errors)
  if (cleanUrl.endsWith('/api/auth/change-password')) {
    return true;
  }

  return false;
}

/**
 * Normalize URL for comparison (remove query params and trailing slash)
 */
function normalizeUrl(url: string): string {
  return url.split('?')[0].replace(/\/$/, '');
}

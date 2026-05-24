import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthStore } from './auth.store';

const BEARER_PREFIX = 'Bearer ';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  let preparedRequest = request;

  if (shouldSendCredentials(request.url)) {
    preparedRequest = preparedRequest.clone({
      withCredentials: true,
    });
  }

  if (token && shouldAttachToken(request.url)) {
    preparedRequest = preparedRequest.clone({
      setHeaders: {
        Authorization: `${BEARER_PREFIX}${token}`,
      },
    });
  }

  return next(preparedRequest);
};

function shouldAttachToken(url: string): boolean {
  const cleanUrl = normalizeUrl(url);

  return cleanUrl.endsWith('/api/auth/me') || cleanUrl.includes('/api/admin/');
}

function shouldSendCredentials(url: string): boolean {
  const cleanUrl = normalizeUrl(url);

  return cleanUrl.endsWith('/api/auth/login')
    || cleanUrl.endsWith('/api/auth/refresh')
    || cleanUrl.endsWith('/api/auth/logout');
}

function normalizeUrl(url: string): string {
  return url.split('?')[0].replace(/\/$/, '');
}
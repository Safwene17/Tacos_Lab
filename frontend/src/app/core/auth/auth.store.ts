import { computed, Injectable, signal } from '@angular/core';
import type { AdminMeResponseDto } from '../api/model/adminMeResponse';

interface AuthSession {
  accessToken: string;
  me: AdminMeResponseDto | null;
  mustChangePassword: boolean;
}

/**
 * In-memory admin authentication state.
 *
 * Access token is intentionally not persisted in localStorage/sessionStorage.
 * Session restoration is handled through the HttpOnly refresh cookie.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly session = signal<AuthSession | null>(null);

  readonly token = computed(() => this.session()?.accessToken ?? null);
  readonly me = computed(() => this.session()?.me ?? null);
  readonly mustChangePassword = computed(
    () => this.session()?.mustChangePassword ?? false,
  );
  readonly isAuthenticated = computed(() => this.token() !== null);

  setAuth(accessToken: string, mustChangePassword = false): void {
    this.session.set({
      accessToken,
      me: this.session()?.me ?? null,
      mustChangePassword,
    });
  }

  setMe(me: AdminMeResponseDto): void {
    const accessToken = this.token();

    if (!accessToken) {
      return;
    }

    this.session.set({
      accessToken,
      me,
      mustChangePassword: me.mustChangePassword ?? this.mustChangePassword(),
    });
  }

  clearAuth(): void {
    this.session.set(null);
  }
}
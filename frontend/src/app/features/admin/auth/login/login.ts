import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AuthControllerApiService } from '../../../../core/api/api/authController.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import { AdminThemeStore } from '../../../../shared/services/admin-theme.store';

import type { ApiResponseAdminMeResponseDto } from '../../../../core/api/model/apiResponseAdminMeResponse';
import type { ApiResponseAuthResponseDto } from '../../../../core/api/model/apiResponseAuthResponse';
import type { LoginRequestDto } from '../../../../core/api/model/loginRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthControllerApiService);
  private readonly authStore = inject(AuthStore);

  readonly theme = inject(AdminThemeStore);

  readonly loading = signal(false);
  readonly passwordVisible = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(100),
    ]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const request: LoginRequestDto = {
      email: this.form.controls.email.value.trim(),
      password: this.form.controls.password.value,
    };

    this.loading.set(true);

    this.authApi.login(request)
      .pipe(
        switchMap((loginResponse: ApiResponseAuthResponseDto) => {
          const accessToken = loginResponse.data?.accessToken;

          if (!loginResponse.success || !accessToken) {
            throw new Error(
              loginResponse.message ?? 'Login response did not contain an access token.',
            );
          }

          this.authStore.setAuth(
            accessToken,
            loginResponse.data?.mustChangePassword ?? false,
          );

          return this.authApi.me();
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (meResponse: ApiResponseAdminMeResponseDto) => {
          if (!meResponse.success || !meResponse.data) {
            this.authStore.clearAuth();
            toast.error(meResponse.message ?? 'Unable to load your admin profile.');
            return;
          }

          this.authStore.setMe(meResponse.data);
          toast.success('Welcome back.');
          void this.router.navigateByUrl('/admin/dashboard');
        },
        error: (error: unknown) => {
          this.authStore.clearAuth();
          toast.error(this.loginErrorMessage(error));
        },
      });
  }

  togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  emailInvalid(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  passwordInvalid(): boolean {
    const control = this.form.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  private loginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot reach the backend. Check API URL, backend server, or CORS.';
      }

      if (error.status === 401) {
        return 'Invalid email or password.';
      }

      if (error.status === 403) {
        return 'Access denied for this admin account.';
      }

      return error.error?.message ?? `Login failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Login failed.';
  }
}
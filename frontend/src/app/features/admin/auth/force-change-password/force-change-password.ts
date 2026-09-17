import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AuthControllerApiService } from '../../../../core/api/api/authController.service';
import { AuthStore } from '../../../../core/auth/auth.store';

import type { ForceChangePasswordRequestDto } from '../../../../core/api/model/forceChangePasswordRequest';

type ForcePasswordForm = FormGroup<{
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

@Component({
  selector: 'app-force-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './force-change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    `,
  ],
})
export class ForceChangePassword {
  private readonly authApi = inject(AuthControllerApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly displayName = computed(() => {
    const me = this.authStore.me();

    if (!me) {
      return 'Admin';
    }

    return me.email || 'Admin';
  });

  readonly form: ForcePasswordForm = new FormGroup({
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.form.controls.confirmPassword.setErrors({
        mismatch: true,
      });

      this.form.controls.confirmPassword.markAsTouched();
      return;
    }

    // For forced password change, only send newPassword
    const request: ForceChangePasswordRequestDto = {
      newPassword: value.newPassword,
    };

    this.saving.set(true);

    this.authApi
      .forceChangePassword(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          // Refresh user data to update mustChangePassword flag
          this.authApi.me().subscribe({
            next: (meResponse) => {
              if (meResponse.success && meResponse.data) {
                this.authStore.setMe(meResponse.data);
              }
              toast.success('Password changed successfully. Redirecting...');
              setTimeout(() => {
                void this.router.navigateByUrl('/admin/dashboard');
              }, 1000);
            },
            error: () => {
              // Even if me() fails, redirect anyway since password was changed
              toast.success('Password changed successfully. Redirecting...');
              setTimeout(() => {
                void this.router.navigateByUrl('/admin/dashboard');
              }, 1000);
            },
          });
        },
        error: (error: unknown) => {
          toast.error(this.errorMessage(error));
        },
      });
  }

  fieldError(controlName: keyof ForcePasswordForm['controls']): string | null {
    const control = this.form.controls[controlName];

    if (!control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['minlength']) {
      return 'Password must contain at least 8 characters.';
    }

    if (control.errors['mismatch']) {
      return 'Passwords do not match.';
    }

    if (control.errors['server']) {
      return control.errors['server'];
    }

    return 'Invalid value.';
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed with status ${error.status}.`;
    }

    return 'An error occurred while changing password.';
  }
}

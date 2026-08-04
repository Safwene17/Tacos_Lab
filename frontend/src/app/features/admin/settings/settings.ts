import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { AuthControllerApiService } from '../../../core/api/api/authController.service';
import { AuthStore } from '../../../core/auth/auth.store';

import type { ChangePasswordRequestDto } from '../../../core/api/model/changePasswordRequest';

type PasswordForm = FormGroup<{
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly authApi = inject(AuthControllerApiService);
  private readonly authStore = inject(AuthStore);

  readonly savingPassword = signal(false);

  readonly me = this.authStore.me;

  readonly displayName = computed(() => {
    const me = this.me();

    if (!me) {
      return 'Admin User';
    }

    return me.email || 'Admin User';
  });

  readonly initials = computed(() => {
    const name = this.displayName().trim();

    if (!name) {
      return 'A';
    }

    const parts = name.split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  });

  readonly passwordForm: PasswordForm = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  changePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({
        mismatch: true,
      });

      this.passwordForm.controls.confirmPassword.markAsTouched();
      return;
    }

    const request: ChangePasswordRequestDto = {
      currentPassword: value.currentPassword,
      newPassword: value.newPassword,
    };

    this.savingPassword.set(true);

    this.authApi
      .changePassword(request)
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          toast.success('Password changed successfully.');
          this.passwordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
        error: (error: unknown) => {
          this.applyApiErrors(error);
          toast.error(this.errorMessage(error));
        },
      });
  }

  passwordFieldError(controlName: keyof PasswordForm['controls']): string | null {
    const control = this.passwordForm.controls[controlName];

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

  private applyApiErrors(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      return;
    }

    const errors = error.error?.errors as Record<string, string> | undefined;

    if (!errors) {
      return;
    }

    Object.entries(errors).forEach(([field, message]) => {
      const control = this.passwordForm.get(field);

      if (control) {
        control.setErrors({
          ...(control.errors ?? {}),
          server: message,
        });

        control.markAsTouched();
      }
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error.';
  }
}
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants/auth.constants';

import { Step } from '@shared/interfaces/ui/generic/send-state.interface';
import { PasswordResetConfirmation } from '@shared/interfaces/auth/password-reset-confirmation.interface';

import { maxUtf8Bytes, passwordMatchValidator } from '@shared/validators/password.validator';

import { describeHttpError } from '@shared/utils/http-error.util';

import { AuthService } from '@core/services/auth.service';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Location } from '@angular/common';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [AuthCard, RouterLink, ReactiveFormsModule],
  selector: 'app-reset-password-confirmation',
  styleUrl: '../../styles/auth-form.css',
  templateUrl: './reset-password-confirmation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordConfirmation {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly token =
    readFragmentToken(this.route.snapshot.fragment) ??
    this.route.snapshot.queryParamMap.get('token');

  protected readonly step = signal<Step>('idle');
  protected readonly submitError = signal<string | null>(null);

  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly maxPasswordLength = MAX_PASSWORD_LENGTH;

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
          maxUtf8Bytes(MAX_PASSWORD_LENGTH),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') },
  );

  protected get newPassword() {
    return this.form.controls.newPassword;
  }
  protected get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  constructor() {
    if (this.token) {
      this.location.replaceState('/auth/reset-password-confirmation');
    }
  }

  protected showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected confirmInvalid(): boolean {
    return (
      this.confirmPassword.touched &&
      (this.confirmPassword.hasError('required') || this.form.hasError('passwordMismatch'))
    );
  }

  protected onSubmit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.step.set('loading');

    const resetConfirmation: PasswordResetConfirmation = {
      token: this.token ?? '',
      newPassword: this.newPassword.value,
    };

    this.authService
      .resetPassword(resetConfirmation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.step.set('done'),
        error: (error: unknown) => {
          this.step.set('idle');
          this.submitError.set(
            describeHttpError(error, 'This reset link has expired or was already used.'),
          );
        },
      });
  }
}

function readFragmentToken(fragment: string | null): string | null {
  return fragment ? new URLSearchParams(fragment).get('token') : null;
}

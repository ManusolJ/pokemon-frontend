import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants/auth.constants';

import { Step } from '@shared/interfaces/ui/generic/send-state.interface';
import { PasswordResetConfirmation } from '@shared/interfaces/auth/password-reset-confirmation.interface';

import { passwordMatchValidator } from '@shared/validators/password.validator';

import { AuthService } from '@core/services/auth.service';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly step = signal<Step>('idle');

  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly maxPasswordLength = MAX_PASSWORD_LENGTH;

  protected readonly form = this.formBuilder.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
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

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.step.set('loading');

    const resetConfirmation: PasswordResetConfirmation = {
      token: this.token ?? '',
      newPassword: this.newPassword.value ?? '',
    };

    this.authService
      .resetPassword(resetConfirmation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.step.set('done'),
        error: () => this.step.set('idle'),
      });
  }
}

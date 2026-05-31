import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { AuthCard } from '@features/auth/components/auth-card/auth-card';
import { MIN_PASSWORD_LENGTH } from '@shared/constants/auth.constants';
import { PasswordResetConfirmation } from '@shared/interfaces/auth/password-reset-confirmation.interface';
import { Step } from '@shared/interfaces/ui/generic/send-state.interface';
import { passwordMatchValidator } from '@shared/validators/password.validator';

@Component({
  imports: [AuthCard, RouterLink, ReactiveFormsModule],
  selector: 'app-reset-password-confirmation',
  styleUrl: '../../styles/auth-form.css',
  templateUrl: './reset-password-confirmation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordConfirmation {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly step = signal<Step>('idle');

  protected readonly min_password_length = MIN_PASSWORD_LENGTH;

  protected readonly form = this.formBuilder.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
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

    this.authService.resetPassword(resetConfirmation).subscribe({
      next: () => this.step.set('done'),
      error: () => this.step.set('idle'),
    });
  }
}

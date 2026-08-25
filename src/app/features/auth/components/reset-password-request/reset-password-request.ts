import { MAX_EMAIL_LENGTH } from '@shared/constants/auth.constants';

import { Step } from '@shared/interfaces/ui/generic/send-state.interface';
import { PasswordResetRequest } from '@shared/interfaces/auth/password-reset-request.interface';

import { AuthService } from '@core/services/auth.service';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [AuthCard, ReactiveFormsModule, RouterLink],
  selector: 'app-reset-password-request',
  styleUrl: '../../styles/auth-form.css',
  templateUrl: './reset-password-request.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordRequest {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly step = signal<Step>('idle');

  protected readonly maxEmailLength = MAX_EMAIL_LENGTH;

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
  });

  protected get email() {
    return this.form.controls.email;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.step.set('loading');

    const resetRequest: PasswordResetRequest = {
      email: this.email.value ?? '',
    };

    this.authService
      .requestPasswordReset(resetRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.step.set('done'),
        error: () => this.step.set('idle'),
      });
  }
}

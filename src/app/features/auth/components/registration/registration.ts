import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@shared/constants/auth.constants';

import { RegisterRequest } from '@shared/interfaces/auth/register-request.interface';

import { passwordMatchValidator } from '@shared/validators/password.validator';

import { safeRedirect } from '@shared/utils/redirect.util';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { AuthService } from '@core/services/auth.service';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { finalize } from 'rxjs';

@Component({
  imports: [AuthCard, RouterLink, ReactiveFormsModule],
  selector: 'app-registration',
  styleUrl: '../../styles/auth-form.css',
  templateUrl: './registration.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);

  protected readonly maxEmailLength = MAX_EMAIL_LENGTH;
  protected readonly minUsernameLength = MIN_USERNAME_LENGTH;
  protected readonly maxUsernameLength = MAX_USERNAME_LENGTH;
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly maxPasswordLength = MAX_PASSWORD_LENGTH;

  protected readonly form = this.formBuilder.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_USERNAME_LENGTH),
          Validators.maxLength(MAX_USERNAME_LENGTH),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator() },
  );

  protected get username() {
    return this.form.controls.username;
  }
  protected get email() {
    return this.form.controls.email;
  }
  protected get password() {
    return this.form.controls.password;
  }
  protected get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const registrationRequest: RegisterRequest = {
      username: this.username.value ?? '',
      email: this.email.value ?? '',
      password: this.password.value ?? '',
      confirmPassword: this.confirmPassword.value ?? '',
    };

    this.authService
      .register(registrationRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl(
            safeRedirect(this.route.snapshot.queryParamMap.get('redirectTo')),
          );
        },
        error: () => {},
      });
  }
}

import {
  MAX_EMAIL_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@shared/constants/auth.constants';

import { LoginRequest } from '@shared/interfaces/auth/login-request.interface';

import { safeRedirect } from '@shared/utils/redirect.util';

import { AuthService } from '@core/services/auth.service';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { finalize } from 'rxjs';

@Component({
  imports: [AuthCard, RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: '../../styles/auth-form.css',
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal<boolean>(false);

  protected readonly maxIdentifierLength = MAX_EMAIL_LENGTH;
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly minIdentifierLength = MIN_USERNAME_LENGTH;

  protected readonly form = this.formBuilder.group({
    identifier: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_EMAIL_LENGTH),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
  });

  protected get identifier() {
    return this.form.controls.identifier;
  }

  protected get password() {
    return this.form.controls.password;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      identifier: this.identifier.value ?? '',
      password: this.password.value ?? '',
    };

    this.authService
      .login(loginRequest)
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

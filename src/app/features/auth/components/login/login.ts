import {
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@shared/constants/auth.constants';

import { LoginRequest } from '@shared/interfaces/auth/login-request.interface';

import { AuthService } from '@core/services/auth.service';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal<boolean>(false);

  protected readonly min_username_length = MIN_USERNAME_LENGTH;
  protected readonly max_username_length = MAX_USERNAME_LENGTH;
  protected readonly min_password_length = MIN_PASSWORD_LENGTH;

  protected readonly form = this.formBuilder.group({
    identifier: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_USERNAME_LENGTH),
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
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const target = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/';
          this.router.navigateByUrl(target);
        },
        error: () => {},
      });
  }
}

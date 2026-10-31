import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@shared/constants/auth.constants';
import { ADMIN_ROLE } from '@shared/constants/auth.constants';

import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';
import { PasswordChange } from '@shared/interfaces/pokemon/user/password-change.interface';
import { FormSubmissionStatus } from '@shared/interfaces/ui/form/form-submission-status.interface';

import { maxUtf8Bytes, passwordMatchValidator } from '@shared/validators/password.validator';

import { formatJoinDate } from '@shared/utils/format-date.util';
import { describeHttpError } from '@shared/utils/http-error.util';

import { Modal } from '@shared/components/modal/modal';

import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

import { Router } from '@angular/router';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize, tap } from 'rxjs';

import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [ReactiveFormsModule, Modal],
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  protected readonly maxEmailLength = MAX_EMAIL_LENGTH;
  protected readonly minUsernameLength = MIN_USERNAME_LENGTH;
  protected readonly maxUsernameLength = MAX_USERNAME_LENGTH;
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly maxPasswordLength = MAX_PASSWORD_LENGTH;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  protected readonly accountStatus = signal<FormSubmissionStatus>('idle');
  protected readonly accountError = signal<string | null>(null);
  protected readonly passwordStatus = signal<FormSubmissionStatus>('idle');
  protected readonly passwordError = signal<string | null>(null);

  protected readonly deleteOpen = signal(false);
  protected readonly deletePending = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly accountForm = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_USERNAME_LENGTH),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
    currentPassword: ['', [Validators.required, maxUtf8Bytes(MAX_PASSWORD_LENGTH)]],
  });

  protected readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, maxUtf8Bytes(MAX_PASSWORD_LENGTH)]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
          maxUtf8Bytes(MAX_PASSWORD_LENGTH),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('newPassword', 'confirmPassword')] },
  );

  protected get username() {
    return this.accountForm.controls.username;
  }
  protected get email() {
    return this.accountForm.controls.email;
  }
  protected get accountPassword() {
    return this.accountForm.controls.currentPassword;
  }
  protected get currentPassword() {
    return this.passwordForm.controls.currentPassword;
  }
  protected get newPassword() {
    return this.passwordForm.controls.newPassword;
  }
  protected get confirmPassword() {
    return this.passwordForm.controls.confirmPassword;
  }

  private readonly userResource = rxResource<UserRead | null, void>({
    stream: () => this.userService.getUserSelf().pipe(tap((loaded) => this.applyToForm(loaded))),
    defaultValue: null,
  });

  protected readonly user = computed<UserRead | null>(() => this.userResource.value());
  protected readonly isLoading = computed<boolean>(() => this.userResource.isLoading());
  protected readonly loadError = computed<boolean>(() => this.userResource.error() !== undefined);

  protected readonly isAdmin = computed(() => this.user()?.role === ADMIN_ROLE);
  protected readonly memberSince = computed(() => formatJoinDate(this.user()?.createdAt));

  private readonly accountValues = toSignal(this.accountForm.valueChanges, {
    initialValue: this.accountForm.getRawValue(),
  });

  protected readonly accountDirty = computed(() => {
    const loaded = this.user();
    const values = this.accountValues();
    return (
      loaded !== null &&
      ((values.username !== undefined && values.username !== loaded.username) ||
        (values.email !== undefined && values.email.trim().toLowerCase() !== loaded.email))
    );
  });

  protected showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected confirmInvalid(): boolean {
    return (
      this.confirmPassword.touched &&
      (this.confirmPassword.hasError('required') || this.passwordForm.hasError('passwordMismatch'))
    );
  }

  protected resetAccountForm(): void {
    const loaded = this.user();
    if (loaded) {
      this.applyToForm(loaded);
    }
    this.accountError.set(null);
  }

  protected onSubmitAccount(): void {
    const loaded = this.user();
    this.accountError.set(null);

    if (!loaded || !this.accountDirty() || this.accountStatus() === 'saving') {
      return;
    }
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const { username, email, currentPassword } = this.accountForm.getRawValue();
    this.accountStatus.set('saving');

    this.userService
      .userSelfUpdate({ currentPassword, newUsername: username.trim(), newEmail: email.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.signOutAfterCredentialChange(),
        error: (error: unknown) => {
          this.accountStatus.set('error');
          this.reportSaveError(error, this.accountPassword, this.accountError);
        },
      });
  }

  protected onSubmitPassword(): void {
    this.passwordError.set(null);

    if (this.passwordStatus() === 'saving') {
      return;
    }
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: PasswordChange = { currentPassword, newPassword };
    this.passwordStatus.set('saving');

    this.userService
      .userSelfPasswordChange(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.signOutAfterCredentialChange(),
        error: (error: unknown) => {
          this.passwordStatus.set('error');
          this.reportSaveError(error, this.currentPassword, this.passwordError);
        },
      });
  }

  protected openDelete(): void {
    if (!this.isAdmin()) {
      this.deleteError.set(null);
      this.deleteOpen.set(true);
    }
  }

  protected closeDelete(): void {
    if (!this.deletePending()) {
      this.deleteOpen.set(false);
    }
  }

  protected confirmDelete(): void {
    if (this.deletePending() || this.isAdmin()) {
      return;
    }

    this.deletePending.set(true);
    this.deleteError.set(null);

    this.userService
      .userSelfDeactivation()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletePending.set(false)),
      )
      .subscribe({
        next: () => {
          this.deleteOpen.set(false);
          this.authService.signOut();
          void this.router.navigate(['/']);
        },
        error: (error: unknown) => this.deleteError.set(describeHttpError(error)),
      });
  }

  private signOutAfterCredentialChange(): void {
    this.authService.signOut();
    void this.router.navigate(['/auth/login'], { queryParams: { notice: 'credentials-changed' } });
  }

  private reportSaveError(
    error: unknown,
    passwordControl: AbstractControl,
    formError: { set(value: string | null): void },
  ): void {
    const message = describeHttpError(error);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 400 &&
      /current password/i.test(message)
    ) {
      passwordControl.setErrors({ wrongPassword: true });
      passwordControl.markAsTouched();
      return;
    }

    formError.set(message);
  }

  private applyToForm(user: UserRead): void {
    this.accountForm.reset({ username: user.username, email: user.email, currentPassword: '' });
  }
}

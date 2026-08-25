import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@shared/constants/auth.constants';
import { ADMIN_ROLE } from '@shared/constants/auth.constants';

import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';
import { UserUpdate } from '@shared/interfaces/pokemon/user/user-update.interface';
import { PasswordChange } from '@shared/interfaces/pokemon/user/password-change.interface';
import { FormSubmissionStatus } from '@shared/interfaces/ui/form/form-submission-status.interface';

import { passwordMatchValidator } from '@shared/validators/password.validator';

import { formatJoinDate } from '@shared/utils/format-date.util';

import { Modal } from '@shared/components/modal/modal';

import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { TokenRefreshService } from '@core/services/token-refresh.service';

import { Router } from '@angular/router';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize, map, Observable, switchMap, tap } from 'rxjs';

import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [ReactiveFormsModule, Modal],
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css', '../auth/styles/auth-form.css'],
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
  private readonly refreshService = inject(TokenRefreshService);

  protected readonly emailStatus = signal<FormSubmissionStatus>('idle');
  protected readonly usernameStatus = signal<FormSubmissionStatus>('idle');
  protected readonly passwordStatus = signal<FormSubmissionStatus>('idle');

  protected readonly deleteOpen = signal(false);
  protected readonly deletePending = signal(false);

  protected readonly usernameForm = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_USERNAME_LENGTH),
      ],
    ],
  });

  protected readonly emailForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
  });

  protected readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('newPassword', 'confirmPassword')] },
  );

  protected get username() {
    return this.usernameForm.controls.username;
  }
  protected get email() {
    return this.emailForm.controls.email;
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
    stream: () => this.userService.getUserSelf().pipe(tap((loaded) => this.applyToForms(loaded))),
    defaultValue: null,
  });

  protected readonly user = computed<UserRead | null>(() => this.userResource.value());
  protected readonly isLoading = computed<boolean>(() => this.userResource.isLoading());
  protected readonly loadError = computed<boolean>(() => this.userResource.error() !== undefined);

  protected readonly isAdmin = computed(() => this.user()?.role === ADMIN_ROLE);
  protected readonly memberSince = computed(() => formatJoinDate(this.user()?.createdAt));

  private readonly emailInputValue = toSignal(this.email.valueChanges, { initialValue: '' });
  private readonly usernameInputValue = toSignal(this.username.valueChanges, { initialValue: '' });

  protected readonly usernameDirty = computed(() => {
    const loaded = this.user();
    return loaded !== null && this.usernameInputValue() !== loaded.username;
  });

  protected readonly emailDirty = computed(() => {
    const loaded = this.user();
    return loaded !== null && this.emailInputValue() !== loaded.email;
  });

  protected onSubmitUsername(): void {
    const loaded = this.user();
    if (!loaded || !this.usernameDirty()) {
      return;
    }
    this.submitUserUpdate(this.usernameForm, this.usernameStatus, {
      newUsername: this.username.value,
      newEmail: loaded.email,
    });
  }

  protected onSubmitEmail(): void {
    const loaded = this.user();
    if (!loaded || !this.emailDirty()) {
      return;
    }
    this.submitUserUpdate(this.emailForm, this.emailStatus, {
      newUsername: loaded.username,
      newEmail: this.email.value,
    });
  }

  protected onSubmitPassword(): void {
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: PasswordChange = { currentPassword, newPassword };
    this.runSave(
      this.passwordForm,
      this.passwordStatus,
      this.userService.userSelfPasswordChange(request),
      () => this.passwordForm.reset(),
    );
  }

  protected openDelete(): void {
    if (this.isAdmin()) {
      return;
    }
    this.deleteOpen.set(true);
  }

  protected closeDelete(): void {
    if (this.deletePending()) {
      return;
    }
    this.deleteOpen.set(false);
  }

  protected confirmDelete(): void {
    if (this.deletePending() || this.isAdmin()) {
      return;
    }

    this.deletePending.set(true);

    this.userService
      .userSelfDeactivation()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletePending.set(false)),
      )
      .subscribe({
        next: () => {
          this.deleteOpen.set(false);
          this.logoutAndGoHome();
        },
        error: () => {},
      });
  }

  private submitUserUpdate(
    form: FormGroup,
    status: WritableSignal<FormSubmissionStatus>,
    request: UserUpdate,
  ): void {
    const update = this.userService
      .userSelfUpdate(request)
      .pipe(
        switchMap((updated) => this.refreshService.renewAfterInFlight().pipe(map(() => updated))),
      );

    this.runSave(form, status, update, (updated) => {
      this.userResource.set(updated);
      this.applyToForms(updated);
    });
  }

  private runSave<T>(
    form: FormGroup,
    status: WritableSignal<FormSubmissionStatus>,
    request: Observable<T>,
    onSuccess: (result: T) => void,
  ): void {
    if (form.invalid || status() === 'saving') {
      form.markAllAsTouched();
      return;
    }

    status.set('saving');

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        onSuccess(result);
        status.set('saved');
      },
      error: () => status.set('error'),
    });
  }

  private logoutAndGoHome(): void {
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.router.navigate(['/']);
  }

  private applyToForms(user: UserRead): void {
    this.usernameForm.reset({ username: user.username });
    this.emailForm.reset({ email: user.email });
  }
}

import { ADMIN_ROLE, USER_ROLE } from '@shared/constants/api.constants';
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '@shared/constants/auth.constants';

import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';
import { AdminUserUpdate } from '@shared/interfaces/pokemon/user/admin-user-update.interface';
import { FormSubmissionStatus } from '@shared/interfaces/ui/form/form-submission-status.interface';

import { formatJoinDate } from '@shared/utils/format-date.util';

import { UserService } from '@core/services/user.service';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { map, of, tap } from 'rxjs';

import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

const INITIALS_LENGTH = 2;
const PLACEHOLDER_INITIALS = '??';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-user-edit',
  styleUrl: './user-edit.css',
  templateUrl: './user-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEdit {
  protected readonly roleAdmin = ADMIN_ROLE;
  protected readonly roleUser = USER_ROLE;
  protected readonly min_username_length = MIN_USERNAME_LENGTH;
  protected readonly max_username_length = MAX_USERNAME_LENGTH;

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly saveStatus = signal<FormSubmissionStatus>('idle');

  protected readonly form = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_USERNAME_LENGTH),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    role: [USER_ROLE, [Validators.required]],
    enabled: [true],
  });

  protected get username() {
    return this.form.controls.username;
  }
  protected get email() {
    return this.form.controls.email;
  }
  protected get role() {
    return this.form.controls.role;
  }
  protected get enabled() {
    return this.form.controls.enabled;
  }

  private readonly routeUserIdParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
  );

  private readonly targetUserId = computed<number | null>(() => {
    const raw = this.routeUserIdParam();
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  });

  private readonly userResource = rxResource({
    params: () => this.targetUserId(),
    stream: ({ params }) => {
      if (params === null) {
        return of<UserRead | null>(null);
      }
      return this.userService
        .adminGetOneUser({ id: params })
        .pipe(tap((loaded) => this.applyToForm(loaded)));
    },
    defaultValue: null,
  });

  protected readonly user = computed<UserRead | null>(() => this.userResource.value());
  protected readonly isLoading = computed<boolean>(() => this.userResource.isLoading());
  protected readonly loadError = computed<boolean>(
    () => this.targetUserId() === null || this.userResource.error() !== undefined,
  );

  protected readonly isAdmin = computed(() => this.user()?.role === ADMIN_ROLE);
  protected readonly memberSince = computed(() => formatJoinDate(this.user()?.createdAt, 'short'));

  protected initials(username: string | undefined): string {
    const source = username ?? PLACEHOLDER_INITIALS;
    return source.slice(0, INITIALS_LENGTH).toUpperCase();
  }

  protected setRole(value: string): void {
    this.role.setValue(value);
    this.role.markAsDirty();
  }

  protected onSubmit(): void {
    const currentUser = this.user();
    if (!currentUser || this.form.invalid || this.saveStatus() === 'saving') {
      this.form.markAllAsTouched();
      return;
    }

    this.saveStatus.set('saving');

    const formValue = this.form.getRawValue();
    const request: AdminUserUpdate = {
      newUsername: formValue.username,
      newEmail: formValue.email,
      newRole: formValue.role,
      enabled: formValue.enabled,
    };

    this.userService
      .adminUserUpdate(currentUser.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.userResource.set(updated);
          this.applyToForm(updated);
          this.saveStatus.set('saved');
        },
        error: () => this.saveStatus.set('error'),
      });
  }

  private applyToForm(user: UserRead): void {
    this.form.reset({
      username: user.username,
      email: user.email,
      role: user.role,
      enabled: user.enabled,
    });
  }
}

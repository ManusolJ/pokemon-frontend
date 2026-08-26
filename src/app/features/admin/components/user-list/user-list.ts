import { ADMIN_ROLE, USER_ROLE } from '@shared/constants/auth.constants';

import { ConfirmCopy } from '@shared/interfaces/admin/confirm-copy.interface';
import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';
import { UserFilter } from '@shared/interfaces/pokemon/user/user-filter.interface';
import { ConfirmKind, ConfirmRequest } from '@shared/interfaces/admin/confirm-request.interface';

import { UserService } from '@core/services/user.service';

import {
  endOfLocalDayIso,
  formatJoinDate,
  startOfLocalDayIso,
} from '@shared/utils/format-date.util';

import { debouncedText } from '@shared/utils/debounced-text.util';

import { Modal } from '@shared/components/modal/modal';

import { Router } from '@angular/router';

import { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Observable, finalize, map, tap } from 'rxjs';

import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

const PAGE_SIZE = 9;
const INITIALS_LENGTH = 2;

const ROLE_FILTER_ALL = 'ALL' as const;
const STATUS_FILTER_ALL = 'ALL' as const;
const STATUS_FILTER_ACTIVE = 'ACTIVE' as const;
const STATUS_FILTER_DISABLED = 'DISABLED' as const;

type RoleFilter = typeof ROLE_FILTER_ALL | typeof USER_ROLE | typeof ADMIN_ROLE;
type StatusFilter =
  | typeof STATUS_FILTER_ALL
  | typeof STATUS_FILTER_ACTIVE
  | typeof STATUS_FILTER_DISABLED;

const EMPTY_CONFIRM_COPY: ConfirmCopy = { title: '', body: '', button: '', danger: false };

@Component({
  imports: [Modal, PaginatorModule, FormsModule],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList {
  protected readonly pageSize = PAGE_SIZE;
  protected readonly roleUser = USER_ROLE;
  protected readonly roleAdmin = ADMIN_ROLE;
  protected readonly roleFilterAll = ROLE_FILTER_ALL;
  protected readonly statusFilterAll = STATUS_FILTER_ALL;
  protected readonly statusFilterActive = STATUS_FILTER_ACTIVE;
  protected readonly statusFilterDisabled = STATUS_FILTER_DISABLED;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);

  private readonly searchText = debouncedText(() => this.page.set(0));
  protected readonly search = this.searchText.live;
  protected readonly toDate = signal('');
  protected readonly fromDate = signal('');
  protected readonly selectedRole = signal<RoleFilter>(ROLE_FILTER_ALL);
  protected readonly selectedStatus = signal<StatusFilter>(STATUS_FILTER_ALL);

  private readonly debouncedSearch = this.searchText.settled;

  private readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected readonly isConfirmPending = signal(false);
  protected readonly confirmRequest = signal<ConfirmRequest | null>(null);

  private readonly currentFilter = computed<UserFilter>(() => {
    const role = this.selectedRole();
    const status = this.selectedStatus();
    return {
      username: this.debouncedSearch().trim() || undefined,
      role: role === ROLE_FILTER_ALL ? undefined : role,
      enabled: status === STATUS_FILTER_ALL ? undefined : status === STATUS_FILTER_ACTIVE,
      includeDeleted: status !== STATUS_FILTER_ACTIVE,
      createdAfter: startOfLocalDayIso(this.fromDate()),
      createdBefore: endOfLocalDayIso(this.toDate()),
    };
  });

  private readonly usersResource = rxResource({
    params: () => ({ filter: this.currentFilter(), page: this.page() }),
    stream: ({ params }) =>
      this.userService
        .adminGetUserPageWithFilter(params.filter, {
          page: params.page,
          size: PAGE_SIZE,
          sort: 'createdAt',
          direction: 'DESC',
        })
        .pipe(
          tap((response) => {
            this.total.set(response.page.totalElements);
            this.totalPages.set(response.page.totalPages);
          }),
          map((response) => response.content),
        ),
    defaultValue: [],
  });

  protected readonly users = computed<UserRead[]>(() => this.usersResource.value());
  protected readonly isLoading = computed<boolean>(() => this.usersResource.isLoading());
  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  private readonly fetchedUsersIds = computed(() => this.users().map((user) => user.id));

  protected readonly allOnPageSelected = computed<boolean>(() => {
    const ids = this.fetchedUsersIds();
    if (ids.length === 0) {
      return false;
    }
    const selected = this.selectedIds();
    return ids.every((id) => selected.has(id));
  });

  protected readonly firstRecordIndex = computed(() => this.page() * PAGE_SIZE);

  protected readonly hasActiveFilters = computed(
    () =>
      this.search() !== '' ||
      this.fromDate() !== '' ||
      this.toDate() !== '' ||
      this.selectedRole() !== ROLE_FILTER_ALL ||
      this.selectedStatus() !== STATUS_FILTER_ALL,
  );

  protected readonly confirmCopy = computed<ConfirmCopy>(() => {
    const request = this.confirmRequest();
    if (!request) {
      return EMPTY_CONFIRM_COPY;
    }
    return buildConfirmCopy(request);
  });

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
  }

  protected setRole(value: RoleFilter): void {
    this.page.set(0);
    this.selectedRole.set(value);
  }

  protected setStatus(value: StatusFilter): void {
    this.page.set(0);
    this.selectedStatus.set(value);
  }

  protected onFromDateChange(value: string): void {
    this.fromDate.set(value);
    this.page.set(0);
  }

  protected onToDateChange(value: string): void {
    this.toDate.set(value);
    this.page.set(0);
  }

  protected isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected toggleOne(id: number, checked: boolean): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  protected toggleAllOnPage(checked: boolean): void {
    const idsOnPage = this.fetchedUsersIds();
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of idsOnPage) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected onEdit(user: UserRead): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  protected onToggleEnabled(user: UserRead): void {
    const kind: ConfirmKind = user.enabled ? 'disable' : 'reactivate';
    this.confirmRequest.set({ kind, user });
  }

  protected onDelete(user: UserRead): void {
    this.confirmRequest.set({ kind: 'delete', user });
  }

  protected batchDisable(): void {
    this.requestBatchConfirm('disable');
  }

  protected batchReactivate(): void {
    this.requestBatchConfirm('reactivate');
  }

  protected batchDelete(): void {
    this.requestBatchConfirm('delete');
  }

  protected closeConfirm(): void {
    if (this.isConfirmPending()) {
      return;
    }
    this.confirmRequest.set(null);
  }

  protected runConfirm(): void {
    const request = this.confirmRequest();
    if (!request || this.isConfirmPending()) {
      return;
    }

    this.isConfirmPending.set(true);

    const affectedIds = request.user ? [request.user.id] : [...(request.batchIds ?? [])];
    const operation$ = this.buildConfirmOperation(request);

    operation$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isConfirmPending.set(false)),
      )
      .subscribe({
        next: () => {
          this.removeFromSelection(affectedIds);
          this.confirmRequest.set(null);
          this.usersResource.reload();
        },
        error: () => {},
      });
  }

  protected onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  protected clearFilters(): void {
    this.searchText.reset();
    this.fromDate.set('');
    this.toDate.set('');
    this.selectedRole.set(ROLE_FILTER_ALL);
    this.selectedStatus.set(STATUS_FILTER_ALL);
    this.page.set(0);
  }

  protected initials(username: string): string {
    return username.slice(0, INITIALS_LENGTH).toUpperCase();
  }

  protected formatDate(iso: string): string {
    return formatJoinDate(iso, 'short');
  }

  /** Tombstoned: deactivated from this screen, as opposed to merely disabled via the edit form. */
  protected isDeleted(user: UserRead): boolean {
    return user.deletedAt !== null;
  }

  protected deletedLabel(user: UserRead): string {
    return user.deletedAt ? `Deactivated ${formatJoinDate(user.deletedAt, 'short')}` : '';
  }

  protected isAdminRole(role: string): boolean {
    return role === ADMIN_ROLE;
  }

  private requestBatchConfirm(kind: ConfirmKind): void {
    if (this.selectedCount() === 0) {
      return;
    }
    this.confirmRequest.set({ kind, batchIds: [...this.selectedIds()] });
  }

  private removeFromSelection(ids: readonly number[]): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const id of ids) {
        next.delete(id);
      }
      return next;
    });
  }

  private buildConfirmOperation(request: ConfirmRequest): Observable<void> {
    const singleId = request.user?.id;
    const batchIds = [...(request.batchIds ?? [])];

    if (request.kind === 'disable') {
      return singleId !== undefined
        ? this.userService.adminUserDeactivation(singleId)
        : this.userService.adminUserBatchDeactivation(batchIds);
    }
    if (request.kind === 'reactivate') {
      return singleId !== undefined
        ? this.userService.adminUserReactivation(singleId)
        : this.userService.adminUserBatchReactivation(batchIds);
    }
    return singleId !== undefined
      ? this.userService.adminUserDelete(singleId)
      : this.userService.adminUserBatchDelete(batchIds);
  }
}

function buildConfirmCopy(request: ConfirmRequest): ConfirmCopy {
  const target = formatConfirmTarget(request);
  const isSingle = !!request.user;

  if (request.kind === 'disable') {
    return {
      title: isSingle ? 'Disable user?' : 'Disable selected users?',
      body: `${target} won't be able to sign in until reactivated. Their data is preserved.`,
      button: 'Disable',
      danger: false,
    };
  }
  if (request.kind === 'reactivate') {
    return {
      title: isSingle ? 'Reactivate user?' : 'Reactivate selected users?',
      body: `${target} will be able to sign in again.`,
      button: 'Reactivate',
      danger: false,
    };
  }
  return {
    title: isSingle ? 'Delete user?' : 'Delete selected users?',
    body: `This permanently removes ${target} along with any saved teams, likes and audit history. This cannot be undone.`,
    button: 'Delete',
    danger: true,
  };
}

function formatConfirmTarget(request: ConfirmRequest): string {
  if (request.user) {
    return `“${request.user.username}”`;
  }
  const count = request.batchIds?.length ?? 0;
  return `${count} user${count === 1 ? '' : 's'}`;
}

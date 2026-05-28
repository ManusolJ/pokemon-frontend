import {
  ADMIN_ENDPOINT,
  ADMIN_ID_ENDPOINT,
  USER_SELF_ENDPOINT,
  ADMIN_COUNT_ENDPOINT,
  ADMIN_FILTER_ENDPOINT,
  ADMIN_SUMMARY_ENDPOINT,
  ADMIN_HARD_DELETE_ENDPOINT,
  USER_SELF_PASSWORD_ENDPOINT,
  ADMIN_REACTIVATION_ENDPOINT,
  ADMIN_BATCH_DISABLE_ENDPOINT,
  ADMIN_BATCH_HARD_DELETE_ENDPOINT,
  ADMIN_BATCH_REACTIVATION_ENDPOINT,
} from '@shared/constants/api.constants';

import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';

import { BaseApiService } from './base-api.service';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { UserUpdate } from '@shared/interfaces/pokemon/user/user-update.interface';
import { UserFilter } from '@shared/interfaces/pokemon/user/user-filter.interface';
import { UserSummary } from '@shared/interfaces/pokemon/user/user-summary.interface';
import { PasswordChange } from '@shared/interfaces/pokemon/user/password-change.interface';
import { AdminUserUpdate } from '@shared/interfaces/pokemon/user/admin-user-update.interface';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'users/';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  getUserSelf(): Observable<UserRead> {
    return this.get<UserRead>(`${ENDPOINT}${USER_SELF_ENDPOINT}`);
  }

  userSelfUpdate(updateRequest: UserUpdate): Observable<UserRead> {
    return this.put<UserRead>(`${ENDPOINT}${USER_SELF_ENDPOINT}`, updateRequest);
  }

  userSelfPasswordChange(change: PasswordChange): Observable<void> {
    return this.put<void>(`${ENDPOINT}${USER_SELF_PASSWORD_ENDPOINT}`, change);
  }

  userSelfDeactivation(): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${USER_SELF_ENDPOINT}`);
  }

  adminGetOneUser(filter: UserFilter): Observable<UserRead> {
    return this.post<UserRead>(`${ENDPOINT}${ADMIN_ID_ENDPOINT}`, filter);
  }

  adminGetUserPageWithFilter(filter: UserFilter, pageable?: Pageable): Observable<Page<UserRead>> {
    return this.postPaged<Page<UserRead>>(`${ENDPOINT}${ADMIN_FILTER_ENDPOINT}`, filter, pageable);
  }

  adminGetUserSummaryPageWithFilter(
    filter: UserFilter,
    pageable?: Pageable,
  ): Observable<Page<UserSummary>> {
    return this.postPaged<Page<UserSummary>>(
      `${ENDPOINT}${ADMIN_SUMMARY_ENDPOINT}`,
      filter,
      pageable,
    );
  }

  adminGetUserCountWithFilter(filter: UserFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${ADMIN_COUNT_ENDPOINT}`, filter);
  }

  adminUserUpdate(id: number, updateRequest: AdminUserUpdate): Observable<UserRead> {
    return this.put<UserRead>(`${ENDPOINT}${ADMIN_ENDPOINT}/${id}`, updateRequest);
  }

  adminUserDeactivation(id: number): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${ADMIN_ENDPOINT}/${id}`);
  }

  adminUserReactivation(id: number): Observable<void> {
    return this.post<void>(
      `${ENDPOINT}${ADMIN_ENDPOINT}/${id}/${ADMIN_REACTIVATION_ENDPOINT}`,
      null,
    );
  }

  adminUserDelete(id: number): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${ADMIN_ENDPOINT}/${id}/${ADMIN_HARD_DELETE_ENDPOINT}`);
  }

  adminUserBatchDelete(ids: number[]): Observable<void> {
    return this.post<void>(`${ENDPOINT}${ADMIN_BATCH_HARD_DELETE_ENDPOINT}`, ids);
  }

  adminUserBatchDeactivation(ids: number[]): Observable<void> {
    return this.post<void>(`${ENDPOINT}${ADMIN_BATCH_DISABLE_ENDPOINT}`, ids);
  }

  adminUserBatchReactivation(ids: number[]): Observable<void> {
    return this.post<void>(`${ENDPOINT}${ADMIN_BATCH_REACTIVATION_ENDPOINT}`, ids);
  }
}

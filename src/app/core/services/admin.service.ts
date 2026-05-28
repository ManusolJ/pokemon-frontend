import {
  SEED_ENDPOINT,
  SEED_LOG_FILTER_ENDPOINT,
  AUDIT_LOG_FILTER_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { SeedLogRead } from '@shared/interfaces/pokemon/admin/seed-log-read.interface';
import { AuditLogRead } from '@shared/interfaces/pokemon/admin/audit-log-read.interface';
import { SeedLogFilter } from '@shared/interfaces/pokemon/admin/seed-log-filter.interface';
import { AuditLogFilter } from '@shared/interfaces/pokemon/admin/audit-log-filter.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT: string = 'admin/';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseApiService {
  seed(): Observable<SeedLogRead> {
    return this.post<SeedLogRead>(`${ENDPOINT}${SEED_ENDPOINT}`, null);
  }

  getSeedLogPageWithFilter(
    filter: SeedLogFilter,
    pageable?: Pageable,
  ): Observable<Page<SeedLogRead>> {
    return this.postPaged<Page<SeedLogRead>>(
      `${ENDPOINT}${SEED_LOG_FILTER_ENDPOINT}`,
      filter,
      pageable,
    );
  }

  getAllAuditLogPageWithFilter(
    filter: AuditLogFilter,
    pageable?: Pageable,
  ): Observable<Page<AuditLogRead>> {
    return this.postPaged<Page<AuditLogRead>>(
      `${ENDPOINT}${AUDIT_LOG_FILTER_ENDPOINT}`,
      filter,
      pageable,
    );
  }
}

import { AdminService } from '@core/services/admin.service';

import { FilterOption } from '@shared/interfaces/ui/filter/filter-field.interface';
import { SeedLogRead } from '@shared/interfaces/pokemon/admin/seed-log-read.interface';
import { AuditLogRead } from '@shared/interfaces/pokemon/admin/audit-log-read.interface';
import { SeedLogFilter } from '@shared/interfaces/pokemon/admin/seed-log-filter.interface';
import { AuditLogFilter } from '@shared/interfaces/pokemon/admin/audit-log-filter.interface';

import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { map, of, tap } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { rxResource } from '@angular/core/rxjs-interop';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

const PAGE_SIZE = 10;
const EMPTY_PLACEHOLDER = '—';
const SEARCH_DEBOUNCE_MS = 300;

const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

const START_OF_DAY_SUFFIX = 'T00:00:00.000Z';
const END_OF_DAY_SUFFIX = 'T23:59:59.999Z';

const LOG_KIND_SEED = 'SEED' as const;
const LOG_KIND_AUDIT = 'AUDIT' as const;
type LogKind = typeof LOG_KIND_SEED | typeof LOG_KIND_AUDIT;

const SEED_STATUS_ALL = 'ALL' as const;
const SEED_STATUS_COMPLETED = 'Completed' as const;
const SEED_STATUS_RUNNING = 'Running' as const;
const SEED_STATUS_FAILED = 'Failed' as const;
const SEED_STATUS_UNKNOWN = 'Unknown' as const;
type SeedStatusFilter =
  | typeof SEED_STATUS_ALL
  | typeof SEED_STATUS_COMPLETED
  | typeof SEED_STATUS_RUNNING
  | typeof SEED_STATUS_FAILED
  | typeof SEED_STATUS_UNKNOWN;

const SEED_STATUS_OPTIONS: readonly FilterOption[] = [
  { label: 'All', value: SEED_STATUS_ALL },
  { label: 'Success', value: SEED_STATUS_COMPLETED },
  { label: 'Running', value: SEED_STATUS_RUNNING },
  { label: 'Failed', value: SEED_STATUS_FAILED },
  { label: 'Unknown', value: SEED_STATUS_UNKNOWN },
];

const DATETIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

@Component({
  imports: [FormsModule, PaginatorModule, NameNormalizerPipe],
  selector: 'app-admin-logs',
  styleUrl: './admin-logs.css',
  templateUrl: './admin-logs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogs {
  protected readonly pageSize = PAGE_SIZE;
  protected readonly logKindSeed = LOG_KIND_SEED;
  protected readonly logKindAudit = LOG_KIND_AUDIT;
  protected readonly seedStatusAll = SEED_STATUS_ALL;
  protected readonly seedStatusOptions = SEED_STATUS_OPTIONS;

  private readonly adminService = inject(AdminService);

  protected readonly kind = signal<LogKind>(LOG_KIND_SEED);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);

  protected readonly search = signal('');
  protected readonly fromDate = signal('');
  protected readonly toDate = signal('');
  protected readonly seedStatus = signal<SeedStatusFilter>(SEED_STATUS_ALL);

  private readonly debouncedSearch = signal('');
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly currentSeedFilter = computed<SeedLogFilter>(() => {
    const status = this.seedStatus();
    return {
      triggeredBy: this.debouncedSearch().trim() || undefined,
      status: status === SEED_STATUS_ALL ? undefined : status,
      dateFrom: toStartOfDayInstant(this.fromDate()),
      dateTo: toEndOfDayInstant(this.toDate()),
    };
  });

  private readonly currentAuditFilter = computed<AuditLogFilter>(() => ({
    username: this.debouncedSearch().trim() || undefined,
    dateFrom: toStartOfDayInstant(this.fromDate()),
    dateTo: toEndOfDayInstant(this.toDate()),
  }));

  private readonly seedLogsResource = rxResource({
    params: () => ({
      active: this.kind() === LOG_KIND_SEED,
      filter: this.currentSeedFilter(),
      page: this.page(),
    }),
    stream: ({ params }) => {
      if (!params.active) {
        return of<SeedLogRead[]>([]);
      }
      return this.adminService
        .getSeedLogPageWithFilter(params.filter, {
          page: params.page,
          size: PAGE_SIZE,
          sort: 'startedAt',
          direction: 'DESC',
        })
        .pipe(
          tap((response) => {
            this.total.set(response.page.totalElements);
            this.totalPages.set(response.page.totalPages);
          }),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  private readonly auditLogsResource = rxResource({
    params: () => ({
      active: this.kind() === LOG_KIND_AUDIT,
      filter: this.currentAuditFilter(),
      page: this.page(),
    }),
    stream: ({ params }) => {
      if (!params.active) {
        return of<AuditLogRead[]>([]);
      }
      return this.adminService
        .getAuditLogPageWithFilter(params.filter, {
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
        );
    },
    defaultValue: [],
  });

  protected readonly seedLogs = computed<SeedLogRead[]>(() => this.seedLogsResource.value());
  protected readonly auditLogs = computed<AuditLogRead[]>(() => this.auditLogsResource.value());

  protected readonly isLoading = computed<boolean>(() =>
    this.kind() === LOG_KIND_SEED
      ? this.seedLogsResource.isLoading()
      : this.auditLogsResource.isLoading(),
  );

  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  protected readonly searchPlaceholder = computed(() =>
    this.kind() === LOG_KIND_SEED ? 'Search by triggered-by user…' : 'Search by username…',
  );

  protected readonly entriesLabel = computed(() =>
    this.kind() === LOG_KIND_SEED ? 'entries' : 'events',
  );

  protected readonly hasActiveFilters = computed(
    () =>
      this.search() !== '' ||
      this.fromDate() !== '' ||
      this.toDate() !== '' ||
      this.seedStatus() !== SEED_STATUS_ALL,
  );

  protected readonly firstRecordIndex = computed(() => this.page() * PAGE_SIZE);

  protected setKind(kind: LogKind): void {
    if (this.kind() === kind) {
      return;
    }
    this.clearFilters();
    this.kind.set(kind);
  }

  protected onSearchInput(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value);
      this.page.set(0);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected setSeedStatus(value: SeedStatusFilter): void {
    this.seedStatus.set(value);
    this.page.set(0);
  }

  protected onFromDateChange(value: string): void {
    this.fromDate.set(value);
    this.page.set(0);
  }

  protected onToDateChange(value: string): void {
    this.toDate.set(value);
    this.page.set(0);
  }

  protected clearFilters(): void {
    clearTimeout(this.searchDebounceTimer);
    this.search.set('');
    this.debouncedSearch.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.seedStatus.set(SEED_STATUS_ALL);
    this.page.set(0);
  }

  protected onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  protected formatDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return EMPTY_PLACEHOLDER;
    }
    return date.toLocaleString(undefined, DATETIME_FORMAT_OPTIONS);
  }

  protected formatTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return EMPTY_PLACEHOLDER;
    }
    return date.toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS);
  }

  protected formatDuration(startedAt: string, completedAt: string | null): string {
    if (!completedAt) {
      return EMPTY_PLACEHOLDER;
    }
    const startMs = new Date(startedAt).getTime();
    const endMs = new Date(completedAt).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return EMPTY_PLACEHOLDER;
    }
    const totalSeconds = Math.max(0, Math.round((endMs - startMs) / MILLISECONDS_IN_SECOND));
    if (totalSeconds < SECONDS_IN_MINUTE) {
      return `${totalSeconds}s`;
    }
    const minutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
    const remainderSeconds = totalSeconds % SECONDS_IN_MINUTE;
    return `${minutes}m ${remainderSeconds}s`;
  }

  protected lastEventTime(log: SeedLogRead): string {
    return log.completedAt ?? log.startedAt;
  }

  protected statusClass(status: string): string {
    return `status-tag status-tag--${status.toLowerCase()}`;
  }
}

function toStartOfDayInstant(isoDate: string): string | undefined {
  return isoDate ? `${isoDate}${START_OF_DAY_SUFFIX}` : undefined;
}

function toEndOfDayInstant(isoDate: string): string | undefined {
  return isoDate ? `${isoDate}${END_OF_DAY_SUFFIX}` : undefined;
}

import { TEAMS_SHARED_PATH } from '@shared/constants/teams.constants';

import { TeamSortOption } from '@shared/interfaces/ui/team/team-sort-option.interface';
import { TeamLikeToggleEvent } from '@shared/interfaces/ui/team/team-like-toggle-event.interface';

import { AuthService } from '@core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { TeamLikeService } from '@core/services/team-like.service';

import { ListShell } from '@shared/components/list-shell/list-shell';

import { toggleTeamLike } from '@shared/utils/team.util';

import { TeamCard } from '@features/teams/components/team-card/team-card';

import { map, tap } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';

const PAGE_SIZE = 6;
const DEFAULT_SORT_ID = 'likes-desc';

type PublicSortField = 'likeCount' | 'createdAt' | 'name';

const SORT_OPTIONS: ReadonlyArray<TeamSortOption<PublicSortField>> = [
  { id: 'likes-desc', label: 'Most liked', field: 'likeCount', direction: 'DESC' },
  { id: 'likes-asc', label: 'Least liked', field: 'likeCount', direction: 'ASC' },
  { id: 'recent', label: 'Recent', field: 'createdAt', direction: 'DESC' },
  { id: 'oldest', label: 'Oldest', field: 'createdAt', direction: 'ASC' },
  { id: 'name-asc', label: 'A → Z', field: 'name', direction: 'ASC' },
];

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  imports: [ListShell, TeamCard],
  selector: 'app-public-team-list',
  styleUrl: './public-team-list.css',
  templateUrl: './public-team-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTeamList {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly likeService = inject(TeamLikeService);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly sorts = SORT_OPTIONS;

  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly query = signal('');
  private readonly debouncedQuery = signal('');
  private readonly pendingLikeIds = signal<ReadonlySet<number>>(new Set());

  protected readonly likeDisabled = computed(() => !this.authService.isAuthenticated());

  protected readonly sortId = signal<string>(DEFAULT_SORT_ID);
  protected readonly currentSort = computed<TeamSortOption<PublicSortField>>(
    () => this.sorts.find((option) => option.id === this.sortId()) ?? this.sorts[0],
  );

  protected readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly teamResource = rxResource({
    params: () => ({ page: this.page(), query: this.debouncedQuery(), sort: this.currentSort() }),
    stream: ({ params }) => {
      return this.teamService
        .getPublicTeamPageWithFilter(
          { isPublic: true, name: params.query },
          {
            page: params.page,
            size: PAGE_SIZE,
            direction: params.sort.direction,
            sort: params.sort.field,
          },
        )
        .pipe(
          tap((response) => this.total.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly teams = this.teamResource.value;
  protected readonly loading = computed<boolean>(() => this.teamResource.isLoading());

  protected onSearch(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedQuery.set(value);
      this.page.set(0);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
  }

  protected setSort(id: string): void {
    if (this.sortId() === id) {
      return;
    }
    this.sortId.set(id);
    this.page.set(0);
  }

  protected onSelect(id: number): void {
    void this.router.navigate([TEAMS_SHARED_PATH, id]);
  }

  protected isLikePending(id: number): boolean {
    return this.pendingLikeIds().has(id);
  }

  protected onLikeToggle(event: TeamLikeToggleEvent): void {
    if (this.isLikePending(event.id)) {
      return;
    }
    const previous = this.teams();
    const next = previous.map((team) =>
      team.id === event.id ? toggleTeamLike(team, event.liked) : team,
    );
    this.teams.set(next);
    this.markLikePending(event.id, true);

    this.likeService
      .toggleLike(event.id, event.liked)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.markLikePending(event.id, false),
        error: () => {
          this.teams.set(previous);
          this.markLikePending(event.id, false);
        },
      });
  }

  private markLikePending(id: number, pending: boolean): void {
    this.pendingLikeIds.update((set) => {
      const next = new Set(set);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}

import {
  TEAMS_MY_PATH,
  TEAMS_SHARED_PATH,
  TEAM_BUILDER_PATH,
  TEAMS_SEARCH_DEBOUNCE_MS,
} from '@shared/constants/teams.constants';

import {
  VisibilityTab,
  VisibilityTabId,
} from '@shared/interfaces/ui/team/visibility-tab.interface';
import { TeamSortOption } from '@shared/interfaces/ui/team/team-sort-option.interface';
import { PrivateTeamCardActionEvent } from '@shared/interfaces/ui/team/private-team-card-action-event.interface';

import { TeamService } from '@core/services/team.service';
import { TeamHydrationService } from '@core/services/team-hydration.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { ListShell } from '@shared/components/list-shell/list-shell';

import { PrivateTeamCard } from '@features/teams/components/private-team-card/private-team-card';

import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { map, tap } from 'rxjs';

import { Router } from '@angular/router';

const PAGE_SIZE = 12;
const DEFAULT_SORT_ID = 'recent';
const DEFAULT_TAB_ID: VisibilityTabId = 'all';

type PrivateSortField = 'updatedAt' | 'name' | 'likeCount';

const SORT_OPTIONS: ReadonlyArray<TeamSortOption<PrivateSortField>> = [
  { id: 'recent', label: 'Recently edited', field: 'updatedAt', direction: 'DESC' },
  { id: 'oldest', label: 'Oldest', field: 'updatedAt', direction: 'ASC' },
  { id: 'name-asc', label: 'A → Z', field: 'name', direction: 'ASC' },
  { id: 'likes-desc', label: 'Most liked', field: 'likeCount', direction: 'DESC' },
];

const VISIBILITY_TABS: readonly VisibilityTab[] = [
  { id: 'all', label: 'All', isPublic: undefined },
  { id: 'public', label: 'Public', isPublic: true },
  { id: 'private', label: 'Private', isPublic: false },
];

@Component({
  imports: [ListShell, PrivateTeamCard],
  selector: 'app-private-team-list',
  styleUrl: './private-team-list.css',
  templateUrl: './private-team-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateTeamList {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teamService = inject(TeamService);
  private readonly builderState = inject(TeamBuilderStateService);
  private readonly hydrationService = inject(TeamHydrationService);

  protected readonly sorts = SORT_OPTIONS;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly tabs = VISIBILITY_TABS;

  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly searchInput = signal('');
  private readonly debouncedQuery = signal('');

  protected readonly sortId = signal<string>(DEFAULT_SORT_ID);
  protected readonly activeTab = signal<VisibilityTabId>(DEFAULT_TAB_ID);
  protected readonly currentSort = computed<TeamSortOption<PrivateSortField>>(
    () => this.sorts.find((option) => option.id === this.sortId()) ?? this.sorts[0],
  );

  protected readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly teamResource = rxResource({
    params: () => ({
      page: this.page(),
      query: this.debouncedQuery(),
      sort: this.currentSort(),
      tab: this.tabs.find((entry) => entry.id === this.activeTab()),
    }),
    stream: ({ params }) => {
      const trimmed = params.query.trim();
      return this.teamService
        .getSelfTeamPageWithFilter(
          { name: trimmed || undefined, isPublic: params.tab?.isPublic },
          {
            page: params.page,
            size: PAGE_SIZE,
            sort: params.sort.field,
            direction: params.sort.direction,
          },
        )
        .pipe(
          tap((response) => this.total.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly items = this.teamResource.value;
  protected readonly loading = computed(() => this.teamResource.isLoading());

  protected onSearchInput(value: string): void {
    this.searchInput.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedQuery.set(value);
      this.page.set(0);
    }, TEAMS_SEARCH_DEBOUNCE_MS);
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
  }

  protected setTab(id: VisibilityTabId): void {
    if (this.activeTab() === id) {
      return;
    }
    this.activeTab.set(id);
    this.page.set(0);
  }

  protected setSort(id: string): void {
    if (this.sortId() === id) {
      return;
    }
    this.sortId.set(id);
    this.page.set(0);
  }

  protected newTeam(): void {
    void this.router.navigate([TEAM_BUILDER_PATH]);
  }

  protected onSelect(id: number): void {
    void this.router.navigate([TEAMS_MY_PATH, id]);
  }

  protected onAction(event: PrivateTeamCardActionEvent): void {
    switch (event.kind) {
      case 'edit':
        this.editInBuilder(event.id);
        return;
      case 'toggle-visibility':
        this.toggleVisibility(event.id);
        return;
      case 'share':
        this.share(event.id);
        return;
      case 'delete':
        this.delete(event.id);
        return;
    }
  }

  private editInBuilder(id: number): void {
    this.hydrationService
      .loadSelfTeamAsDraft(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (draft) => {
          this.builderState.loadFromTeam(draft);
          void this.router.navigate([TEAM_BUILDER_PATH]);
        },
      });
  }

  private toggleVisibility(id: number): void {
    const team = this.items().find((entry) => entry.id === id);
    if (!team) {
      return;
    }
    const nextIsPublic = !team.isPublic;

    this.items.update((arr) =>
      arr.map((entry) => (entry.id === id ? { ...entry, isPublic: nextIsPublic } : entry)),
    );

    this.teamService
      .patchTeam(id, { isPublic: nextIsPublic })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.teamResource.reload() });
  }

  private share(id: number): void {
    const team = this.items().find((entry) => entry.id === id);
    if (!team || !team.isPublic) {
      return;
    }
    const url = `${window.location.origin}${TEAMS_SHARED_PATH}/${id}`;
    void navigator.clipboard?.writeText(url);
  }

  private delete(id: number): void {
    this.items.update((arr) => arr.filter((entry) => entry.id !== id));
    this.total.update((count) => Math.max(0, count - 1));

    this.teamService
      .deleteTeam(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.teamResource.reload() });
  }
}

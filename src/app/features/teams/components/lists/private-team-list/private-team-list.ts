import { urlPage } from '@shared/utils/url-page.util';

import { COPIED_FEEDBACK_MS, TEAM_BUILDER_PATH } from '@shared/constants/teams.constants';

import { TeamSummary } from '@shared/interfaces/pokemon/team/team-summary.interface';

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

import { copyToClipboard, shareLinkUrl } from '@shared/utils/share.util';
import { describeHttpError } from '@shared/utils/http-error.util';

import { Modal } from '@shared/components/modal/modal';

import { debouncedText } from '@shared/utils/debounced-text.util';

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

import { finalize, map, tap } from 'rxjs';

import { Router, RouterLink } from '@angular/router';

const PAGE_SIZE = 12;
const DEFAULT_SORT_ID = 'recent';
const DEFAULT_TAB_ID: VisibilityTabId = 'all';

type PrivateSortField = 'updatedAt' | 'name' | 'likeCount';

const SORT_OPTIONS: ReadonlyArray<TeamSortOption<PrivateSortField>> = [
  { id: 'recent', label: 'Recently edited', field: 'updatedAt', direction: 'DESC' },
  { id: 'oldest', label: 'Oldest', field: 'updatedAt', direction: 'ASC' },
  { id: 'name-asc', label: 'Name', field: 'name', direction: 'ASC' },
  { id: 'likes-desc', label: 'Most liked', field: 'likeCount', direction: 'DESC' },
];

const VISIBILITY_TABS: readonly VisibilityTab[] = [
  { id: 'all', label: 'All', isPublic: undefined },
  { id: 'public', label: 'Public', isPublic: true },
  { id: 'private', label: 'Private', isPublic: false },
];

@Component({
  imports: [ListShell, PrivateTeamCard, Modal, RouterLink],
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

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.copiedTimer));
  }

  protected readonly pageSize = PAGE_SIZE;
  protected readonly tabs = VISIBILITY_TABS;

  protected readonly total = signal(0);
  private readonly pager = urlPage();
  protected readonly page = this.pager.page;
  private readonly searchText = debouncedText(() => this.pager.set(0));
  protected readonly searchInput = this.searchText.live;
  private readonly debouncedQuery = this.searchText.settled;

  protected readonly sortId = signal<string>(DEFAULT_SORT_ID);
  protected readonly activeTab = signal<VisibilityTabId>(DEFAULT_TAB_ID);
  protected readonly currentSort = computed<TeamSortOption<PrivateSortField>>(
    () => this.sorts.find((option) => option.id === this.sortId()) ?? this.sorts[0],
  );

  protected readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  /** Teams with a visibility change in flight. */
  protected readonly pendingIds = signal<ReadonlySet<number>>(new Set());
  protected readonly copiedId = signal<number | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly deleteTarget = signal<TeamSummary | null>(null);
  protected readonly deletePending = signal(false);

  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

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
    this.searchText.set(value);
  }


  protected setTab(id: VisibilityTabId): void {
    if (this.activeTab() === id) {
      return;
    }
    this.activeTab.set(id);
    this.pager.set(0);
  }

  protected setSort(id: string): void {
    if (this.sortId() === id) {
      return;
    }
    this.sortId.set(id);
    this.pager.set(0);
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
        this.deleteTarget.set(this.items().find((entry) => entry.id === event.id) ?? null);
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
    if (!team || this.pendingIds().has(id)) {
      return;
    }
    const nextIsPublic = !team.isPublic;
    this.setPending(id, true);
    this.replaceItem({ ...team, isPublic: nextIsPublic });

    this.teamService
      .patchTeam(id, { isPublic: nextIsPublic })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.setPending(id, false)),
      )
      .subscribe({
        next: (saved) =>
          this.replaceItem({
            ...team,
            isPublic: saved.isPublic,
            slug: saved.slug,
            updatedAt: saved.updatedAt,
          }),
        error: () => this.replaceItem(team),
      });
  }

  private share(id: number): void {
    const team = this.items().find((entry) => entry.id === id);
    if (!team) {
      return;
    }
    const url = shareLinkUrl(team.slug);
    void copyToClipboard(url).then((copied) => {
      if (!copied) {
        this.actionError.set(`Couldn't copy automatically. The link is ${url}`);
        return;
      }
      this.actionError.set(null);
      this.copiedId.set(id);
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copiedId.set(null), COPIED_FEEDBACK_MS);
    });
  }

  protected confirmDelete(): void {
    const team = this.deleteTarget();
    if (!team || this.deletePending()) {
      return;
    }
    this.deletePending.set(true);
    this.actionError.set(null);

    this.teamService
      .deleteTeam(team.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletePending.set(false)),
      )
      .subscribe({
        next: () => {
          this.deleteTarget.set(null);
          this.teamResource.reload();
        },
        error: (error: unknown) => {
          this.deleteTarget.set(null);
          this.actionError.set(
            describeHttpError(error, "Couldn't delete the team. Please try again."),
          );
        },
      });
  }

  private setPending(id: number, pending: boolean): void {
    this.pendingIds.update((ids) => {
      const next = new Set(ids);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private replaceItem(team: TeamSummary): void {
    this.items.update((arr) => arr.map((entry) => (entry.id === team.id ? team : entry)));
  }
}

import {
  TEAMS_MY_PATH,
  TEAMS_SHARED_PATH,
  TEAM_BUILDER_PATH,
  COPIED_FEEDBACK_MS,
} from '@shared/constants/teams.constants';

import { TeamRead } from '@shared/interfaces/pokemon/team/team-read.interface';

import { AuthService } from '@core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { TeamLikeService } from '@core/services/team-like.service';
import { TeamHydrationService } from '@core/services/team-hydration.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { Modal } from '@shared/components/modal/modal';
import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { copyToClipboard, shareLinkUrl } from '@shared/utils/share.util';
import { describeHttpError } from '@shared/utils/http-error.util';
import { formatRelativeDate } from '@shared/utils/format-date.util';
import {
  NEUTRAL_ACCENT,
  TEAM_SLOT_COUNT,
  teamSlotsFilled,
  toggleTeamLike,
  teamRosterAccent,
  teamTypeSpread,
} from '@shared/utils/team.util';

import { LikeButton } from '@features/teams/components/like-button/like-button';
import { TeamPokemonCard } from '@features/teams/components/team-pokemon-card/team-pokemon-card';
import { VisibilityBadge } from '@features/teams/components/visibility-badge/visibility-badge';

import { Observable, finalize } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

export type TeamDetailMode = 'public' | 'own' | 'shared';

@Component({
  imports: [
    Modal,
    TypeBadge,
    RouterLink,
    LikeButton,
    DecimalPipe,
    TeamPokemonCard,
    VisibilityBadge,
  ],
  selector: 'app-team-detail',
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDetail {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly likeService = inject(TeamLikeService);
  private readonly builderState = inject(TeamBuilderStateService);
  private readonly hydrationService = inject(TeamHydrationService);

  protected readonly mode: TeamDetailMode = this.route.snapshot.data['mode'] ?? 'public';
  protected readonly slotCount = TEAM_SLOT_COUNT;

  protected readonly handingOff = signal(false);
  protected readonly likePending = signal(false);
  protected readonly shareCopied = signal(false);
  protected readonly rotatePending = signal(false);
  protected readonly visibilityPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly confirmingDelete = signal(false);
  protected readonly deletePending = signal(false);

  private shareFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });

  private readonly teamResource = rxResource<TeamRead | undefined, { key: string } | undefined>({
    params: () => {
      const key = this.mode === 'shared' ? this.params().get('slug') : this.params().get('id');
      return key ? { key } : undefined;
    },
    stream: ({ params }) => this.load(params.key),
  });

  protected readonly team = this.teamResource.value;
  protected readonly error = computed(() => !!this.teamResource.error());
  protected readonly loading = computed(() => this.teamResource.isLoading());

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isPublic = computed(() => this.team()?.isPublic ?? false);

  protected readonly accent = computed(() => {
    const team = this.team();
    return team ? teamRosterAccent(team) : NEUTRAL_ACCENT;
  });

  protected readonly typeSpread = computed(() => {
    const team = this.team();
    return team ? teamTypeSpread(team) : [];
  });

  protected readonly filled = computed(() => {
    const team = this.team();
    return team ? teamSlotsFilled(team) : 0;
  });

  protected readonly slotsRemaining = computed(() => TEAM_SLOT_COUNT - this.filled());

  protected readonly createdLabel = computed(() => formatRelativeDate(this.team()?.createdAt));
  protected readonly updatedLabel = computed(() => formatRelativeDate(this.team()?.updatedAt));
  protected readonly ownerInitial = computed(
    () => this.team()?.owner.username.charAt(0).toUpperCase() ?? '',
  );

  protected readonly backLink = this.mode === 'own' ? TEAMS_MY_PATH : TEAMS_SHARED_PATH;
  protected readonly backLabel = this.mode === 'own' ? 'Your teams' : 'Community teams';

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.shareFeedbackTimer));
  }

  protected openInBuilder(): void {
    const team = this.team();
    if (!team || this.handingOff()) {
      return;
    }
    this.handingOff.set(true);
    this.hydrationService
      .hydrate(team, { asDraft: this.mode !== 'own' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.handingOff.set(false)),
      )
      .subscribe((draft) => {
        this.builderState.loadFromTeam(draft);
        void this.router.navigate([TEAM_BUILDER_PATH]);
      });
  }

  protected onLikeToggle(liked: boolean): void {
    const team = this.team();
    if (!team || this.likePending()) {
      return;
    }
    this.likePending.set(true);
    this.team.set(toggleTeamLike(team, liked));
    this.likeService
      .toggleLike(team.id, liked)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.likePending.set(false)),
      )
      .subscribe({ error: () => this.team.set(team) });
  }

  protected toggleVisibility(): void {
    const team = this.team();
    if (!team || this.visibilityPending()) {
      return;
    }
    this.visibilityPending.set(true);
    this.actionError.set(null);
    this.team.set({ ...team, isPublic: !team.isPublic });

    this.teamService
      .patchTeam(team.id, { isPublic: !team.isPublic })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.visibilityPending.set(false)),
      )
      .subscribe({
        next: (saved) => this.team.set(saved),
        error: () => this.team.set(team),
      });
  }

  protected share(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    void copyToClipboard(shareLinkUrl(team.slug)).then((copied) => {
      if (copied) {
        this.flashShareCopied();
      } else {
        this.actionError.set(`Couldn't copy automatically. The link is ${shareLinkUrl(team.slug)}`);
      }
    });
  }

  protected rotateShareLink(): void {
    const team = this.team();
    if (!team || this.rotatePending()) {
      return;
    }
    this.rotatePending.set(true);
    this.actionError.set(null);
    this.teamService
      .rotateShareLink(team.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.rotatePending.set(false)),
      )
      .subscribe((saved) => {
        this.team.set(saved);
        this.share();
      });
  }

  protected confirmDelete(): void {
    const team = this.team();
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
          this.confirmingDelete.set(false);
          void this.router.navigate([TEAMS_MY_PATH]);
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  private load(key: string): Observable<TeamRead> {
    if (this.mode === 'shared') {
      return this.teamService.getSharedTeam(key);
    }
    const id = Number(key);
    return this.mode === 'own'
      ? this.teamService.getOneSelfTeam({ id })
      : this.teamService.getOnePublicTeam({ id });
  }

  private flashShareCopied(): void {
    this.shareCopied.set(true);
    clearTimeout(this.shareFeedbackTimer);
    this.shareFeedbackTimer = setTimeout(() => this.shareCopied.set(false), COPIED_FEEDBACK_MS);
  }
}

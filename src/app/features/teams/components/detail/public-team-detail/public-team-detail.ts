import {
  COPIED_FEEDBACK_MS,
  TEAMS_SHARED_PATH,
  TEAM_BUILDER_PATH,
} from '@shared/constants/teams.constants';

import { TeamRead } from '@shared/interfaces/pokemon/team/team-read.interface';

import { AuthService } from '@core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { TeamLikeService } from '@core/services/team-like.service';
import { TeamHydrationService } from '@core/services/team-hydration.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { copyToClipboard, publicTeamUrl } from '@shared/utils/share.util';

import { LikeButton } from '@features/teams/components/like-button/like-button';
import { TeamPokemonCard } from '@features/teams/components/team-pokemon-card/team-pokemon-card';

import {
  NEUTRAL_ACCENT,
  teamTypeSpread,
  toggleTeamLike,
  teamSlotsFilled,
  TEAM_SLOT_COUNT,
  teamRosterAccent,
} from '@shared/utils/team.util';
import { formatRelativeDate } from '@shared/utils/format-date.util';

import { map } from 'rxjs';

import { DecimalPipe } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  imports: [TypeBadge, LikeButton, TeamPokemonCard, RouterLink, DecimalPipe],
  selector: 'app-public-team-detail',
  styleUrl: './public-team-detail.css',
  templateUrl: './public-team-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTeamDetail {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly likeService = inject(TeamLikeService);
  private readonly builderState = inject(TeamBuilderStateService);
  private readonly hydrationService = inject(TeamHydrationService);

  protected readonly slotCount = TEAM_SLOT_COUNT;

  protected readonly importing = signal(false);
  protected readonly likePending = signal(false);
  protected readonly shareCopied = signal(false);

  private shareFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.shareFeedbackTimer));
  }

  private readonly teamId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
  );

  private readonly teamResource = rxResource({
    params: () => {
      const id = this.teamId();
      return id == null || Number.isNaN(id) ? undefined : { id };
    },
    stream: ({ params }) => this.teamService.getOnePublicTeam(params),
  });

  protected readonly team = this.teamResource.value;
  protected readonly loading = computed(() => this.teamResource.isLoading());
  protected readonly error = computed(() => !!this.teamResource.error());

  protected readonly likeDisabled = computed(() => !this.authService.isAuthenticated());

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

  protected readonly createdLabel = computed(() => formatRelativeDate(this.team()?.createdAt));

  protected readonly ownerInitial = computed(() => {
    const owner = this.team()?.owner;
    return owner ? owner.username.charAt(0).toUpperCase() : '';
  });

  protected takeIntoBuilder(): void {
    const team = this.team();
    if (!team || this.importing()) {
      return;
    }
    this.importing.set(true);
    this.hydrationService
      .loadPublicTeamAsDraft(team.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (draft) => {
          this.builderState.loadFromTeam(draft);
          void this.router.navigate([TEAM_BUILDER_PATH]);
        },
        error: () => this.importing.set(false),
      });
  }

  protected onLikeToggle(liked: boolean): void {
    const team = this.team();
    if (!team || this.likePending()) {
      return;
    }
    const previous: TeamRead = team;
    this.team.set(toggleTeamLike(team, liked));
    this.likePending.set(true);
    this.likeService
      .toggleLike(team.id, liked)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.likePending.set(false),
        error: () => {
          this.team.set(previous);
          this.likePending.set(false);
        },
      });
  }

  protected share(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    void copyToClipboard(publicTeamUrl(team.id)).then((copied) => {
      if (copied) {
        this.flashShareCopied();
      }
    });
  }

  protected back(): void {
    void this.router.navigate([TEAMS_SHARED_PATH]);
  }

  private flashShareCopied(): void {
    this.shareCopied.set(true);
    clearTimeout(this.shareFeedbackTimer);
    this.shareFeedbackTimer = setTimeout(() => this.shareCopied.set(false), COPIED_FEEDBACK_MS);
  }
}

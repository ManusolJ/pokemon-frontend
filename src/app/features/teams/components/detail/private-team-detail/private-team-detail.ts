import {
  TEAMS_MY_PATH,
  TEAMS_SHARED_PATH,
  TEAM_BUILDER_PATH,
  COPIED_FEEDBACK_MS,
} from '@shared/constants/teams.constants';

import { TeamService } from '@core/services/team.service';
import { TeamHydrationService } from '@core/services/team-hydration.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import {
  NEUTRAL_ACCENT,
  teamTypeSpread,
  teamSlotsFilled,
  TEAM_SLOT_COUNT,
  teamRosterAccent,
} from '@shared/utils/team.util';
import { formatRelativeDate } from '@shared/utils/format-date.util';

import { TeamPokemonCard } from '@features/teams/components/team-pokemon-card/team-pokemon-card';
import { VisibilityBadge } from '@features/teams/components/visibility-badge/visibility-badge';

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

const PUBLISH_LABEL = 'Publish';
const UNPUBLISH_LABEL = 'Make private';
const EMPTY_SLOT_LABEL_PLURAL = 'slots';
const EMPTY_SLOT_LABEL_SINGULAR = 'slot';

@Component({
  selector: 'app-private-team-detail',
  imports: [TypeBadge, TeamPokemonCard, VisibilityBadge, RouterLink, DecimalPipe],
  templateUrl: './private-team-detail.html',
  styleUrl: './private-team-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateTeamDetail {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teamService = inject(TeamService);
  private readonly builderState = inject(TeamBuilderStateService);
  private readonly hydrationService = inject(TeamHydrationService);

  protected readonly slotCount = TEAM_SLOT_COUNT;

  protected readonly handingOff = signal(false);
  protected readonly shareCopied = signal(false);

  private shareFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly teamId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
  );

  private readonly teamResource = rxResource({
    params: () => {
      const id = this.teamId();
      return id == null || Number.isNaN(id) ? undefined : { id };
    },
    stream: ({ params }) => this.teamService.getOneSelfTeam(params),
  });

  protected readonly team = this.teamResource.value;
  protected readonly loading = computed(() => this.teamResource.isLoading());
  protected readonly error = computed(() => !!this.teamResource.error());

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

  protected readonly emptySlotLabel = computed(() =>
    this.slotsRemaining() === 1 ? EMPTY_SLOT_LABEL_SINGULAR : EMPTY_SLOT_LABEL_PLURAL,
  );

  protected readonly hasEmptySlots = computed(() => this.slotsRemaining() > 0);

  protected readonly isPublic = computed(() => this.team()?.isPublic ?? false);

  protected readonly createdLabel = computed(() => formatRelativeDate(this.team()?.createdAt));
  protected readonly updatedLabel = computed(() => formatRelativeDate(this.team()?.updatedAt));

  protected readonly publishLabel = computed(() =>
    this.isPublic() ? UNPUBLISH_LABEL : PUBLISH_LABEL,
  );

  protected editInBuilder(): void {
    const team = this.team();
    if (!team || this.handingOff()) {
      return;
    }
    this.handingOff.set(true);
    this.hydrationService
      .loadSelfTeamAsDraft(team.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (draft) => {
          this.builderState.loadFromTeam(draft);
          void this.router.navigate([TEAM_BUILDER_PATH]);
        },
        error: () => this.handingOff.set(false),
      });
  }

  protected toggleVisibility(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    const nextIsPublic = !team.isPublic;
    const previous = team;
    this.team.set({ ...team, isPublic: nextIsPublic });
    this.teamService
      .patchTeam(team.id, { isPublic: nextIsPublic })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.team.set(previous) });
  }

  protected share(): void {
    const team = this.team();
    if (!team || !team.isPublic) {
      return;
    }
    const url = `${window.location.origin}${TEAMS_SHARED_PATH}/${team.id}`;
    void navigator.clipboard?.writeText(url).then(() => this.flashShareCopied());
  }

  protected delete(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    this.teamService
      .deleteTeam(team.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.router.navigate([TEAMS_MY_PATH]) });
  }

  protected back(): void {
    void this.router.navigate([TEAMS_MY_PATH]);
  }

  private flashShareCopied(): void {
    this.shareCopied.set(true);
    clearTimeout(this.shareFeedbackTimer);
    this.shareFeedbackTimer = setTimeout(() => this.shareCopied.set(false), COPIED_FEEDBACK_MS);
  }
}

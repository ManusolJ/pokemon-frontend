import { TeamSummary } from '@shared/interfaces/pokemon/team/team-summary.interface';
import { TeamLikeToggleEvent } from '@shared/interfaces/ui/team/team-like-toggle-event.interface';

import { TEAMS_SHARED_PATH } from '@shared/constants/teams.constants';

import { LikeButton } from '@features/teams/components/like-button/like-button';
import { TeamSpriteRow } from '@features/teams/components/sprite-row/team-sprite-row';

import { formatRelativeDate } from '@shared/utils/format-date.util';

import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  imports: [LikeButton, TeamSpriteRow, RouterLink],
  selector: 'app-team-card',
  styleUrl: './team-card.css',
  templateUrl: './team-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCard {
  readonly team = input.required<TeamSummary>();

  readonly likeToggle = output<TeamLikeToggleEvent>();

  protected readonly teamsSharedPath = TEAMS_SHARED_PATH;

  protected readonly createdLabel = computed(() => formatRelativeDate(this.team().createdAt));
  protected readonly ownerInitial = computed(() =>
    this.team().owner.username.charAt(0).toUpperCase(),
  );

  protected onLikeToggle(liked: boolean): void {
    this.likeToggle.emit({ id: this.team().id, liked });
  }
}

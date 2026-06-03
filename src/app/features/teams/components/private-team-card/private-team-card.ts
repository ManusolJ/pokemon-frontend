import { TeamSummary } from '@shared/interfaces/pokemon/team/team-summary.interface';
import { PrivateTeamCardAction } from '@shared/interfaces/ui/team/private-team-card-action.interface';
import { PrivateTeamCardActionEvent } from '@shared/interfaces/ui/team/private-team-card-action-event.interface';

import { TEAM_SLOT_COUNT, teamSlotsFilled } from '@shared/utils/team.util';
import { formatRelativeDate } from '@shared/utils/format-date.util';

import { TeamSpriteRow } from '../sprite-row/team-sprite-row';
import { VisibilityBadge } from '../visibility-badge/visibility-badge';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

const PUBLISH_LABEL = 'Publish';
const UNPUBLISH_LABEL = 'Unpublish';

@Component({
  imports: [TeamSpriteRow, VisibilityBadge],
  selector: 'app-private-team-card',
  styleUrl: './private-team-card.css',
  templateUrl: './private-team-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateTeamCard {
  readonly team = input.required<TeamSummary>();

  readonly select = output<number>();
  readonly action = output<PrivateTeamCardActionEvent>();

  protected readonly slotCount = TEAM_SLOT_COUNT;

  protected readonly publishLabel = computed(() =>
    this.isPublic() ? UNPUBLISH_LABEL : PUBLISH_LABEL,
  );
  protected readonly isEmpty = computed(() => this.filled() === 0);
  protected readonly isPublic = computed(() => this.team().isPublic);
  protected readonly filled = computed(() => teamSlotsFilled(this.team()));
  protected readonly editedLabel = computed(() => formatRelativeDate(this.team().updatedAt));

  protected onSelect(): void {
    this.select.emit(this.team().id);
  }

  protected emit(event: MouseEvent, kind: PrivateTeamCardAction): void {
    event.stopPropagation();
    this.action.emit({ id: this.team().id, kind });
  }
}

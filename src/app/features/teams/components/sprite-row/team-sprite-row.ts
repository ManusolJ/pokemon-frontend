import { environment } from '@environments/environment';

import { TeamSpriteSlot } from '@shared/interfaces/ui/team/team-sprite-slot.interface';

import { TEAM_SLOT_COUNT } from '@shared/utils/team.util';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const SPRITE_PADDING_PX = 10;
const DEFAULT_SLOT_GAP_PX = 6;
const DEFAULT_SLOT_SIZE_PX = 56;

@Component({
  imports: [],
  selector: 'app-team-sprite-row',
  styleUrl: './team-sprite-row.css',
  templateUrl: './team-sprite-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSpriteRow {
  readonly gap = input<number>(DEFAULT_SLOT_GAP_PX);
  readonly size = input<number>(DEFAULT_SLOT_SIZE_PX);
  readonly sprites = input.required<readonly string[]>();

  protected readonly slots = computed<readonly TeamSpriteSlot[]>(() => this.buildSlots());
  protected readonly spriteSize = computed(() => this.size() - SPRITE_PADDING_PX);

  private buildSlots(): readonly TeamSpriteSlot[] {
    const provided = this.sprites();
    return Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => ({
      key: index,
      url: this.absoluteUrlFor(provided[index] ?? null),
    }));
  }

  private absoluteUrlFor(relativeUrl: string | null): string | null {
    if (!relativeUrl) {
      return null;
    }
    return `${environment.spritesBaseUrl}${relativeUrl}`;
  }
}

import { spriteUrl } from '@shared/utils/sprite-url.util';

import { TeamMoveSlot } from '@shared/interfaces/ui/team/team-move-slot.interface';
import { MoveSummary } from '@shared/interfaces/pokemon/move/move-summary.interface';
import { TeamPokemonRead } from '@shared/interfaces/pokemon/team/team-pokemon-read.interface';
import { TeamPokemonMoveEmbed } from '@shared/interfaces/pokemon/team/team-pokemon-move.interface';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { TitleCasePipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const MOVE_SLOT_COUNT = 4;

@Component({
  imports: [TypeBadge, TitleCasePipe],
  selector: 'app-team-pokemon-card',
  styleUrl: './team-pokemon-card.css',
  templateUrl: './team-pokemon-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPokemonCard {
  readonly member = input.required<TeamPokemonRead>();

  protected readonly types = computed(() => this.resolveTypes());
  protected readonly accent = computed(() => this.resolveAccent());
  protected readonly isShiny = computed(() => this.member().shiny);
  protected readonly spriteUrl = computed(() => this.resolveSpriteUrl());
  protected readonly displayName = computed(() => this.resolveDisplayName());
  protected readonly moveSlots = computed<readonly TeamMoveSlot[]>(() => this.buildMoveSlots());

  private resolveAccent(): string {
    const primary = this.member().pokemon.primaryType?.name;
    return getTypeColor(primary);
  }

  private resolveDisplayName(): string {
    const nickname = this.member().nickname?.trim();
    if (nickname) {
      return nickname;
    }
    return this.member().pokemon.name;
  }

  private resolveTypes() {
    const { primaryType, secondaryType } = this.member().pokemon;
    if (!secondaryType) {
      return [primaryType];
    }
    return [primaryType, secondaryType];
  }

  private resolveSpriteUrl(): string {
    const { spriteDefault, spriteShiny } = this.member().pokemon;
    const path = this.member().shiny ? spriteShiny : spriteDefault;
    return spriteUrl(path);
  }

  private buildMoveSlots(): readonly TeamMoveSlot[] {
    const byPosition = this.movesByPosition();
    return Array.from({ length: MOVE_SLOT_COUNT }, (_, index) => ({
      key: index,
      move: byPosition.get(index + 1) ?? null,
    }));
  }

  private movesByPosition(): Map<number, MoveSummary> {
    const map = new Map<number, MoveSummary>();
    for (const slot of this.member().moves) {
      this.addMoveAt(slot, map);
    }
    return map;
  }

  private addMoveAt(slot: TeamPokemonMoveEmbed, target: Map<number, MoveSummary>): void {
    target.set(slot.slotPosition, slot.move);
  }
}

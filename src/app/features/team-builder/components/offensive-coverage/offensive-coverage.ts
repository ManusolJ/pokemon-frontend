import {
  IMMUNE_MULTIPLIER,
  NEUTRAL_MULTIPLIER,
  RESISTED_MULTIPLIER,
  SUPER_EFFECTIVE_MULTIPLIER,
} from '@shared/constants/effectiveness.constants';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { DefenderEntry } from '@shared/interfaces/team-builder/analysis/defender-entry.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';

import {
  bucketOf,
  isDamagingMove,
  getUniqueMoveTypes,
  buildBestOffensiveMultiplier,
} from '@shared/utils/analysis.util';
import { getTypeColor } from '@shared/utils/get-type-color.util';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const DEFAULT_BEST_MULTIPLIER = 0;

const MULTIPLIER_LABELS: Readonly<Record<string, string>> = {
  [String(SUPER_EFFECTIVE_MULTIPLIER)]: '×2',
  [String(NEUTRAL_MULTIPLIER)]: '×1',
  [String(RESISTED_MULTIPLIER)]: '×½',
  [String(IMMUNE_MULTIPLIER)]: '×0',
};

@Component({
  imports: [],
  selector: 'app-offensive-coverage',
  styleUrl: './offensive-coverage.css',
  templateUrl: './offensive-coverage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffensiveCoverage {
  readonly chart = input.required<EffectivenessChart>();
  readonly allTypes = input.required<readonly TypeRead[]>();
  readonly members = input.required<ReadonlyArray<TeamMember | null>>();

  protected readonly moveTypes = computed(() => getUniqueMoveTypes(this.members()));

  protected readonly hasAnyMove = computed(() => this.teamHasAnyDamagingMove());

  protected readonly defenders = computed<readonly DefenderEntry[]>(() => this.buildDefenders());

  protected readonly superCount = computed(
    () => this.defenders().filter((entry) => entry.tone === 'super').length,
  );

  protected readonly resistedCount = computed(
    () =>
      this.defenders().filter((entry) => entry.tone === 'resist' || entry.tone === 'immune').length,
  );

  protected readonly totalCount = computed(() => this.allTypes().length);

  protected getTypeColor(type: string): string {
    return getTypeColor(type);
  }

  private teamHasAnyDamagingMove(): boolean {
    for (const member of this.members()) {
      if (!member) {
        continue;
      }
      for (const move of member.moves) {
        if (move && isDamagingMove(move)) {
          return true;
        }
      }
    }
    return false;
  }

  private buildDefenders(): readonly DefenderEntry[] {
    const best = buildBestOffensiveMultiplier(this.members(), this.chart(), this.allTypes());
    return this.allTypes().map((type) => this.toDefenderEntry(type, best));
  }

  private toDefenderEntry(type: TypeRead, best: ReadonlyMap<string, number>): DefenderEntry {
    const key = type.name.toLowerCase();
    const multiplier = best.get(key) ?? DEFAULT_BEST_MULTIPLIER;
    return {
      type: key,
      multiplier,
      tone: bucketOf(multiplier),
      label: MULTIPLIER_LABELS[String(multiplier)] ?? `×${multiplier}`,
    };
  }
}

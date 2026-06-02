import { STATS } from '@shared/constants/stat.constants';

import { StatKey } from '@shared/interfaces/team-builder/stats/stat-key.interface';
import { StatTone } from '@shared/interfaces/team-builder/stats/stat-tone.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { TeamStatRow } from '@shared/interfaces/team-builder/stats/team-stat-row.interface';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PERCENT_MAX = 100;
const TONE_LOW_THRESHOLD = 50;
const TONE_MID_THRESHOLD = 70;
const TONE_GOOD_THRESHOLD = 90;
const TONE_HIGH_THRESHOLD = 120;

@Component({
  imports: [],
  selector: 'app-team-stats',
  styleUrl: './team-stats.css',
  templateUrl: './team-stats.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStats {
  readonly members = input.required<ReadonlyArray<TeamMember | null>>();

  protected readonly filledMembers = computed<readonly TeamMember[]>(() =>
    this.members().filter((member): member is TeamMember => member !== null),
  );

  protected readonly teamSize = computed(() => this.filledMembers().length);

  protected readonly rows = computed<readonly TeamStatRow[]>(() => this.buildRows());

  protected readonly grandTotal = computed(() =>
    this.rows().reduce((sum, row) => sum + row.total, 0),
  );

  private buildRows(): readonly TeamStatRow[] {
    const team = this.filledMembers();
    if (team.length === 0) {
      return [];
    }

    const totalsByKey = this.sumStats(team);
    const largestTotal = Math.max(...STATS.map((stat) => totalsByKey[stat.key]));

    return STATS.map((stat) =>
      this.toRow(stat.key, stat.short, totalsByKey, largestTotal, team.length),
    );
  }

  private sumStats(team: readonly TeamMember[]): Record<StatKey, number> {
    const totals = emptyStatRecord();
    for (const member of team) {
      for (const stat of STATS) {
        totals[stat.key] += member.baseStats[stat.key];
      }
    }
    return totals;
  }

  private toRow(
    key: StatKey,
    label: string,
    totals: Record<StatKey, number>,
    largestTotal: number,
    teamSize: number,
  ): TeamStatRow {
    const total = totals[key];
    const average = total / teamSize;
    return {
      key,
      label,
      total,
      average: formatAverage(average),
      fillPercent: largestTotal === 0 ? 0 : (total / largestTotal) * PERCENT_MAX,
      tone: toneFor(average),
    };
  }
}

function emptyStatRecord(): Record<StatKey, number> {
  return { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
}

function toneFor(average: number): StatTone {
  if (average >= TONE_HIGH_THRESHOLD) {
    return 'high';
  }
  if (average >= TONE_GOOD_THRESHOLD) {
    return 'good';
  }
  if (average >= TONE_MID_THRESHOLD) {
    return 'mid';
  }
  if (average >= TONE_LOW_THRESHOLD) {
    return 'low';
  }
  return 'weak';
}

function formatAverage(average: number): string {
  return Number.isInteger(average) ? average.toString() : average.toFixed(1);
}

import { EV_PER_STAT_MAX, EV_STEP, EV_TOTAL_MAX, STATS } from '@shared/constants/stat.constants';

import { StatKey } from '@shared/interfaces/team-builder/stats/stat-key.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { StatSpread as StatSpreadValues } from '@shared/interfaces/team-builder/stats/stat-spread.interface';

import { calcHp, calcStat, emptyEvs } from '@shared/utils/stats.util';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

const NATURE_STAT_TO_KEY: Readonly<Record<string, StatKey>> = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPECIAL_ATTACK: 'specialAttack',
  SPECIAL_DEFENSE: 'specialDefense',
  SPEED: 'speed',
};

const NATURE_INCREASE_MODIFIER = 1.1;
const NATURE_DECREASE_MODIFIER = 0.9;
const NATURE_NEUTRAL_MODIFIER = 1.0;
@Component({
  selector: 'app-stat-spread',
  styleUrl: './stat-spread.css',
  templateUrl: './stat-spread.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatSpread {
  readonly member = input.required<TeamMember | null>();
  readonly memberChange = output<TeamMember>();

  protected readonly stats = STATS;
  protected readonly evTotalMax = EV_TOTAL_MAX;
  protected readonly evPerStatMax = EV_PER_STAT_MAX;

  protected readonly usedEvs = computed(() => {
    const member = this.member();
    if (!member) {
      return 0;
    }
    return this.stats.reduce((sum, stat) => sum + member.evs[stat.key], 0);
  });

  protected readonly budgetPct = computed(() =>
    Math.min(100, (this.usedEvs() / EV_TOTAL_MAX) * 100),
  );

  protected readonly overBudget = computed(() => this.usedEvs() > EV_TOTAL_MAX);

  protected readonly calculatedStats = computed<StatSpreadValues | null>(() => {
    const member = this.member();
    if (!member?.baseStats) {
      return null;
    }

    const result: StatSpreadValues | null = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    };

    for (const stat of this.stats) {
      if (stat.key === 'hp') {
        result[stat.key] = calcHp(
          member.baseStats[stat.key],
          member.ivs[stat.key],
          member.evs[stat.key],
          member.level,
        );
      } else {
        const mod = this.getNatureModifier(member, stat.key);
        result[stat.key] = calcStat(
          member.baseStats[stat.key],
          member.ivs[stat.key],
          member.evs[stat.key],
          member.level,
          mod,
        );
      }
    }
    return result;
  });

  protected natureUp(key: StatKey): boolean {
    const nature = this.member()?.nature;
    if (!nature || nature.increasedStat === nature.decreasedStat) {
      return false;
    }
    return NATURE_STAT_TO_KEY[nature.increasedStat] === key;
  }

  protected natureDown(key: StatKey): boolean {
    const nature = this.member()?.nature;
    if (!nature || nature.increasedStat === nature.decreasedStat) {
      return false;
    }
    return NATURE_STAT_TO_KEY[nature.decreasedStat] === key;
  }

  protected step(key: StatKey, delta: number): void {
    const member = this.member();
    if (!member) {
      return;
    }
    const cur = member.evs[key];
    let next = Math.max(0, Math.min(EV_PER_STAT_MAX, cur + delta));
    if (delta > 0) {
      const remaining = EV_TOTAL_MAX - (this.usedEvs() - cur);
      next = Math.min(next, Math.max(0, remaining));
    }
    if (next === cur) {
      return;
    }
    this.memberChange.emit({ ...member, evs: { ...member.evs, [key]: next } });
  }

  protected max(key: StatKey): void {
    const member = this.member();
    if (!member) {
      return;
    }
    const others = this.usedEvs() - member.evs[key];
    const next = Math.min(EV_PER_STAT_MAX, Math.max(0, EV_TOTAL_MAX - others));
    if (next === member.evs[key]) {
      return;
    }
    this.memberChange.emit({ ...member, evs: { ...member.evs, [key]: next } });
  }

  protected resetAll(): void {
    const member = this.member();
    if (!member) {
      return;
    }
    this.memberChange.emit({ ...member, evs: emptyEvs() });
  }

  protected stepNeg = EV_STEP * -1;
  protected stepPos = EV_STEP;

  protected fillPct(value: number): number {
    return Math.min(100, (value / EV_PER_STAT_MAX) * 100);
  }

  private getNatureModifier(member: TeamMember, key: StatKey): number {
    const nature = member.nature;
    if (!nature || nature.increasedStat === nature.decreasedStat) {
      return NATURE_NEUTRAL_MODIFIER;
    }
    if (NATURE_STAT_TO_KEY[nature.increasedStat] === key) {
      return NATURE_INCREASE_MODIFIER;
    }
    if (NATURE_STAT_TO_KEY[nature.decreasedStat] === key) {
      return NATURE_DECREASE_MODIFIER;
    }
    return NATURE_NEUTRAL_MODIFIER;
  }
}

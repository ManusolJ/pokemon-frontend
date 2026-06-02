import {
  IMMUNE_MULTIPLIER,
  NEUTRAL_MULTIPLIER,
  SUPER_EFFECTIVE_THRESHOLD,
} from '@shared/constants/effectiveness.constants';

import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';
import { BucketCounts } from '@shared/interfaces/team-builder/analysis/bucket-counts.interface';
import { MultiplierBucket } from '@shared/interfaces/team-builder/analysis/multiplier-bucket.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';

const STATUS_MOVE_CATEGORY = 'status';

export function effectivenessOf(
  chart: EffectivenessChart,
  attacker: string,
  defender: string,
): number {
  return chart.get(attacker.toLowerCase())?.get(defender.toLowerCase()) ?? NEUTRAL_MULTIPLIER;
}

export function bucketOf(multiplier: number): MultiplierBucket {
  if (multiplier === IMMUNE_MULTIPLIER) {
    return 'immune';
  }
  if (multiplier >= SUPER_EFFECTIVE_THRESHOLD) {
    return 'super';
  }
  if (multiplier >= NEUTRAL_MULTIPLIER) {
    return 'neutral';
  }
  return 'resist';
}

export function isDamagingMove(move: MoveRead): boolean {
  return move.category?.toLowerCase() !== STATUS_MOVE_CATEGORY;
}

export function getUniqueMoveTypes(members: ReadonlyArray<TeamMember | null>): readonly string[] {
  const types = new Set<string>();
  for (const member of members) {
    if (!member) {
      continue;
    }
    for (const move of member.moves) {
      if (move && isDamagingMove(move)) {
        types.add(move.type.name.toLowerCase());
      }
    }
  }
  return Array.from(types).sort();
}

export function buildBestOffensiveMultiplier(
  members: ReadonlyArray<TeamMember | null>,
  chart: EffectivenessChart,
  allTypes: readonly TypeRead[],
): ReadonlyMap<string, number> {
  const bestByDefender = initZeroMap(allTypes);
  const moveTypes = getUniqueMoveTypes(members);

  for (const defender of allTypes) {
    const defenderKey = defender.name.toLowerCase();
    let best = bestByDefender.get(defenderKey) ?? 0;
    for (const moveType of moveTypes) {
      const multiplier = effectivenessOf(chart, moveType, defenderKey);
      if (multiplier > best) {
        best = multiplier;
      }
    }
    bestByDefender.set(defenderKey, best);
  }

  return bestByDefender;
}

export function buildDefensiveCoverage(
  members: ReadonlyArray<TeamMember | null>,
  chart: EffectivenessChart,
  allTypes: readonly TypeRead[],
): ReadonlyMap<string, BucketCounts> {
  const counts = initBucketCountsMap(allTypes);

  for (const attacker of allTypes) {
    const attackerKey = attacker.name.toLowerCase();
    const bucket = counts.get(attackerKey);
    if (!bucket) {
      continue;
    }
    for (const member of members) {
      if (!member) {
        continue;
      }
      const multiplier = combinedDefensiveMultiplier(chart, attackerKey, member);
      bucket[bucketOf(multiplier)]++;
    }
  }

  return counts;
}

function combinedDefensiveMultiplier(
  chart: EffectivenessChart,
  attackerKey: string,
  member: TeamMember,
): number {
  return defenderTypeNames(member).reduce(
    (product, defenderType) => product * effectivenessOf(chart, attackerKey, defenderType),
    NEUTRAL_MULTIPLIER,
  );
}

function defenderTypeNames(member: TeamMember): readonly string[] {
  const names = [member.primaryType.name];
  if (member.secondaryType) {
    names.push(member.secondaryType.name);
  }
  return names;
}

function initZeroMap(allTypes: readonly TypeRead[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const type of allTypes) {
    result.set(type.name.toLowerCase(), 0);
  }
  return result;
}

function initBucketCountsMap(allTypes: readonly TypeRead[]): Map<string, BucketCounts> {
  const result = new Map<string, BucketCounts>();
  for (const type of allTypes) {
    result.set(type.name.toLowerCase(), { super: 0, neutral: 0, resist: 0, immune: 0 });
  }
  return result;
}

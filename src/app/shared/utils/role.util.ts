import {
  ROLE_TONES,
  PIVOT_MOVES,
  SETUP_MOVES,
  ROLE_LABELS,
  CLERIC_MOVES,
  PHAZING_MOVES,
  SCREENS_MOVES,
  TRAPPING_MOVES,
  CHOICE_BAND_ITEMS,
  CHOICE_SCARF_ITEMS,
  CHOICE_SPECS_ITEMS,
  HP_BULKY_THRESHOLD,
  STALLBREAKER_MOVES,
  HAZARD_SETTER_MOVES,
  HAZARD_CONTROL_MOVES,
  SPEED_FAST_THRESHOLD,
  SUICIDE_FINISHER_MOVES,
  ATTACK_STRONG_THRESHOLD,
  DEFENSE_BULKY_THRESHOLD,
  SPEED_REVENGE_THRESHOLD,
  ATTACK_WALLBREAKER_THRESHOLD,
} from '@shared/constants/role.constants';

import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { RoleKey } from '@shared/interfaces/team-builder/role/role-key.interface';
import { RoleInfo } from '@shared/interfaces/team-builder/role/role-info.interface';
import { RoleRule } from '@shared/interfaces/team-builder/role/role-rule.interface';
import { StatShape } from '@shared/interfaces/team-builder/role/stat-shape.interface';
import { ClassificationContext } from '@shared/interfaces/team-builder/role/classification-context.interface';

export function classifyRole(member: TeamMember): RoleInfo {
  const context = buildContext(member);
  const matched = RULES.find((rule) => rule.matches(context));
  const key = matched ? matched.role(context) : classifyByStats(context);
  return toRoleInfo(key);
}

function buildContext(member: TeamMember): ClassificationContext {
  const moves = CollectMoves(member);
  const shape = describeStatShape(member);
  return {
    shape,
    moves,
    item: getItemSlug(member),
    hasSetupMove: hasMoveFrom(moves, SETUP_MOVES),
    hasPivotMove: hasMoveFrom(moves, PIVOT_MOVES),
    hasAnyOffense: shape.hasPhysicalOffense || shape.hasSpecialOffense,
  };
}

const RULES: readonly RoleRule[] = [
  {
    matches: ({ item, hasAnyOffense }) => CHOICE_SCARF_ITEMS.has(item) && hasAnyOffense,
    role: () => 'choice-scarfer',
  },
  {
    matches: ({ moves, shape }) =>
      hasMoveFrom(moves, HAZARD_SETTER_MOVES) &&
      !shape.isBulky &&
      shape.isFast &&
      hasMoveFrom(moves, SUICIDE_FINISHER_MOVES),
    role: () => 'suicide-lead',
  },
  {
    matches: ({ moves }) => hasMoveFrom(moves, HAZARD_SETTER_MOVES),
    role: () => 'hazard-setter',
  },
  {
    matches: ({ moves }) => hasMoveFrom(moves, HAZARD_CONTROL_MOVES),
    role: () => 'hazard-control',
  },
  {
    matches: ({ moves }) => hasMoveFrom(moves, CLERIC_MOVES),
    role: () => 'cleric',
  },
  {
    matches: ({ moves, hasAnyOffense }) => hasMoveFrom(moves, SCREENS_MOVES) && !hasAnyOffense,
    role: () => 'screens-setter',
  },
  {
    matches: ({ moves }) => hasMoveFrom(moves, TRAPPING_MOVES),
    role: () => 'trapper',
  },
  {
    matches: ({ moves, shape }) => hasMoveFrom(moves, PHAZING_MOVES) && shape.isBulky,
    role: () => 'phazer',
  },
  {
    matches: ({ moves, shape, hasAnyOffense }) =>
      hasMoveFrom(moves, STALLBREAKER_MOVES) && hasAnyOffense && shape.isFast,
    role: () => 'stallbreaker',
  },
  {
    matches: ({ hasSetupMove, hasAnyOffense }) => hasSetupMove && hasAnyOffense,
    role: () => 'setup-sweeper',
  },
  {
    matches: (context) => {
      if (!context.hasPivotMove) {
        return false;
      }
      const statRole = classifyByStats(context);
      return statRole === 'versatile' || statRole === 'tank';
    },
    role: () => 'pivot',
  },
  {
    matches: ({ item, shape, hasAnyOffense }) =>
      isChoiceAttacker(item) && !shape.isFast && hasAnyOffense,
    role: () => 'wallbreaker',
  },
];

function classifyByStats(context: ClassificationContext): RoleKey {
  const { shape, hasSetupMove } = context;
  const wall = matchWall(shape);
  if (wall) {
    return wall;
  }
  if (isOffensiveTank(shape)) {
    return 'tank';
  }
  const sweeper = matchSweeper(shape, hasSetupMove);
  if (sweeper) {
    return sweeper;
  }
  if (shape.isPhysicalWallbreaker || shape.isSpecialWallbreaker) {
    return 'wallbreaker';
  }
  return 'versatile';
}

function matchWall(shape: StatShape): RoleKey | null {
  const hasNoOffense = !shape.hasPhysicalOffense && !shape.hasSpecialOffense;
  if (!hasNoOffense || !shape.isBulky) {
    return null;
  }
  if (shape.hasPhysicalDefense && shape.hasSpecialDefense) {
    return 'mixed-wall';
  }
  if (shape.hasPhysicalDefense) {
    return 'physical-wall';
  }
  if (shape.hasSpecialDefense) {
    return 'special-wall';
  }
  return null;
}

function isOffensiveTank(shape: StatShape): boolean {
  const hasAnyOffense = shape.hasPhysicalOffense || shape.hasSpecialOffense;
  const hasAnyDefense = shape.hasPhysicalDefense || shape.hasSpecialDefense;
  return hasAnyOffense && shape.isBulky && hasAnyDefense;
}

function matchSweeper(shape: StatShape, hasSetupMove: boolean): RoleKey | null {
  if (!shape.isFast) {
    return null;
  }
  if (shape.hasPhysicalOffense && shape.hasSpecialOffense) {
    return 'mixed-sweeper';
  }
  if (shape.hasPhysicalOffense) {
    return hasSetupMove ? 'setup-sweeper' : 'physical-sweeper';
  }
  if (shape.hasSpecialOffense) {
    return hasSetupMove ? 'setup-sweeper' : 'special-sweeper';
  }
  return null;
}

function describeStatShape(member: TeamMember): StatShape {
  const { hp, attack, defense, specialAttack, specialDefense, speed } = member.baseStats;
  return {
    isBulky: hp >= HP_BULKY_THRESHOLD,
    isFast: speed >= SPEED_FAST_THRESHOLD,
    isVeryFast: speed >= SPEED_REVENGE_THRESHOLD,
    hasPhysicalOffense: attack >= ATTACK_STRONG_THRESHOLD,
    hasPhysicalDefense: defense >= DEFENSE_BULKY_THRESHOLD,
    hasSpecialOffense: specialAttack >= ATTACK_STRONG_THRESHOLD,
    hasSpecialDefense: specialDefense >= DEFENSE_BULKY_THRESHOLD,
    isPhysicalWallbreaker: attack >= ATTACK_WALLBREAKER_THRESHOLD,
    isSpecialWallbreaker: specialAttack >= ATTACK_WALLBREAKER_THRESHOLD,
  };
}

function CollectMoves(member: TeamMember): ReadonlySet<string> {
  const moves = new Set<string>();
  for (const move of member.moves) {
    if (move) {
      moves.add(normalizeString(move.name));
    }
  }
  return moves;
}

function getItemSlug(member: TeamMember): string {
  if (!member.item) {
    return '';
  }
  return normalizeString(member.item.name);
}

function hasMoveFrom(moves: ReadonlySet<string>, candidates: ReadonlySet<string>): boolean {
  for (const candidate of candidates) {
    if (moves.has(candidate)) {
      return true;
    }
  }
  return false;
}

function isChoiceAttacker(item: string): boolean {
  return CHOICE_BAND_ITEMS.has(item) || CHOICE_SPECS_ITEMS.has(item);
}

function normalizeString(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function toRoleInfo(key: RoleKey): RoleInfo {
  return {
    key,
    label: ROLE_LABELS[key],
    tone: ROLE_TONES[key],
  };
}

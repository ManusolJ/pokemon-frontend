import { StatMeta } from '@shared/interfaces/team-builder/stat-meta.interface';

export const STATS: ReadonlyArray<StatMeta> = [
  { key: 'hp', label: 'HP', short: 'HP' },
  { key: 'attack', label: 'Attack', short: 'Atk' },
  { key: 'defense', label: 'Defense', short: 'Def' },
  { key: 'specialAttack', label: 'Sp. Attack', short: 'SpA' },
  { key: 'specialDefense', label: 'Sp. Defense', short: 'SpD' },
  { key: 'speed', label: 'Speed', short: 'Spe' },
];

export const EV_STEP = 4;
export const EV_TOTAL_MAX = 510;
export const EV_PER_STAT_MAX = 252;

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 100;

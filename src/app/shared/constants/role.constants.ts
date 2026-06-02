import { RoleKey } from '@shared/interfaces/team-builder/role/role-key.interface';
import { RoleTone } from '@shared/interfaces/team-builder/role/role-tone.interface';

export const HAZARD_SETTER_MOVES: ReadonlySet<string> = new Set([
  'spikes',
  'stone-axe',
  'sticky-web',
  'stealth-rock',
  'toxic-spikes',
  'ceaseless-edge',
]);

export const HAZARD_CONTROL_MOVES: ReadonlySet<string> = new Set([
  'defog',
  'tidy-up',
  'rapid-spin',
  'mortal-spin',
  'court-change',
]);

export const CLERIC_MOVES: ReadonlySet<string> = new Set([
  'wish',
  'life-dew',
  'heal-bell',
  'pollen-puff',
  'lunar-dance',
  'healing-wish',
  'aromatherapy',
  'jungle-healing',
]);

export const PIVOT_MOVES: ReadonlySet<string> = new Set([
  'u-turn',
  'teleport',
  'shed-tail',
  'flip-turn',
  'baton-pass',
  'volt-switch',
  'parting-shot',
  'chilly-reception',
]);

export const SETUP_MOVES: ReadonlySet<string> = new Set([
  'coil',
  'curse',
  'growth',
  'bulk-up',
  'agility',
  'work-up',
  'tidy-up',
  'geomancy',
  'calm-mind',
  'tail-glow',
  'nasty-plot',
  'hone-claws',
  'shift-gear',
  'no-retreat',
  'belly-drum',
  'take-heart',
  'acid-armor',
  'rock-polish',
  'shell-smash',
  'swords-dance',
  'dragon-dance',
  'quiver-dance',
  'iron-defense',
  'cosmic-power',
  'victory-dance',
  'clangorous-soul',
]);

export const SCREENS_MOVES: ReadonlySet<string> = new Set([
  'reflect',
  'aurora-veil',
  'light-screen',
]);

export const STALLBREAKER_MOVES: ReadonlySet<string> = new Set(['taunt', 'encore', 'sub-disable']);

export const PHAZING_MOVES: ReadonlySet<string> = new Set([
  'roar',
  'haze',
  'whirlwind',
  'dragon-tail',
  'circle-throw',
]);

export const TRAPPING_MOVES: ReadonlySet<string> = new Set([
  'block',
  'mean-look',
  'spider-web',
  'fairy-lock',
  'anchor-shot',
  'spirit-shackle',
  'thousand-waves',
]);

export const SUICIDE_FINISHER_MOVES: ReadonlySet<string> = new Set([
  'memento',
  'explosion',
  'final-gambit',
]);

export const CHOICE_BAND_ITEMS: ReadonlySet<string> = new Set(['choice-band']);
export const CHOICE_SCARF_ITEMS: ReadonlySet<string> = new Set(['choice-scarf']);
export const CHOICE_SPECS_ITEMS: ReadonlySet<string> = new Set(['choice-specs']);

export const HP_BULKY_THRESHOLD = 90;
export const SPEED_FAST_THRESHOLD = 95;
export const DEFENSE_BULKY_THRESHOLD = 95;
export const SPEED_REVENGE_THRESHOLD = 110;
export const ATTACK_STRONG_THRESHOLD = 100;
export const ATTACK_WALLBREAKER_THRESHOLD = 130;

// FIX: Fucking IDE IS acting up
export const ROLE_LABELS: Readonly<Record<RoleKey, string>> = {
  tank: 'Tank',
  pivot: 'Pivot',
  phazer: 'Phazer',
  cleric: 'Cleric',
  cleaner: 'Cleaner',
  trapper: 'Trapper',
  versatile: 'Versatile',
  'mixed-wall': 'Mixed Wall',
  wallbreaker: 'Wallbreaker',
  'special-wall': 'Special Wall',
  stallbreaker: 'Stallbreaker',
  'suicide-lead': 'Suicide Lead',
  'mixed-sweeper': 'Mixed Sweeper',
  'setup-sweeper': 'Setup Sweeper',
  'physical-wall': 'Physical Wall',
  'hazard-setter': 'Hazard Setter',
  'hazard-control': 'Hazard Control',
  'revenge-killer': 'Revenge Killer',
  'choice-scarfer': 'Choice Scarfer',
  'screens-setter': 'Screens Setter',
  'special-sweeper': 'Special Sweeper',
  'physical-sweeper': 'Physical Sweeper',
};

// FIX: Fucking IDE IS acting up
export const ROLE_TONES: Readonly<Record<RoleKey, RoleTone>> = {
  'special-sweeper': 'special',
  'physical-sweeper': 'physical',
  cleaner: 'speed',
  'revenge-killer': 'speed',
  'choice-scarfer': 'speed',
  tank: 'defense',
  'mixed-wall': 'defense',
  'special-wall': 'defense',
  'physical-wall': 'defense',
  wallbreaker: 'mixed',
  'mixed-sweeper': 'mixed',
  'setup-sweeper': 'mixed',
  pivot: 'utility',
  phazer: 'utility',
  cleric: 'utility',
  trapper: 'utility',
  versatile: 'utility',
  stallbreaker: 'utility',
  'suicide-lead': 'utility',
  'hazard-setter': 'utility',
  'hazard-control': 'utility',
  'screens-setter': 'utility',
};

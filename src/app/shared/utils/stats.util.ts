import { StatSpread } from '@shared/interfaces/team-builder/stat-spread.interface';

export function emptyEvs(): StatSpread {
  return { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
}

export function maxIvs(): StatSpread {
  return { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 };
}

export function calcHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calcStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureMod: number,
): number {
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMod,
  );
}

import type { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

export interface PokemonSummary {
  id: number;
  name: string;
  order: number;
  spriteDefault: string;
  spriteShiny: string;
  primaryType: TypeRead;
  secondaryType: TypeRead | null;
}

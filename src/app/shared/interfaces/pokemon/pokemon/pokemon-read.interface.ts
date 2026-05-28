import { SpeciesSummary } from './species-summary.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { AbilityEmbed } from '@shared/interfaces/pokemon/ability/ability-embed.interface';

export interface PokemonRead {
  id: number;
  name: string;
  order: number;
  species: SpeciesSummary;
  isDefaultForm: boolean;
  primaryType: TypeRead;
  secondaryType: TypeRead | null;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpAtk: number;
  baseSpDef: number;
  baseSpeed: number;
  heightInMeters: number;
  weightInKilograms: number;
  abilities: AbilityEmbed[];
  artworkUrl: string;
  artworkShiny: string | null;
  spriteShiny: string;
  spriteDefault: string;
}

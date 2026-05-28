import { TeamPokemonMoveEmbed } from './team-pokemon-move.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';
import { AbilitySummary } from '@shared/interfaces/pokemon/ability/ability-summary.interface';
import { PokemonSummary } from '@shared/interfaces/pokemon/pokemon/pokemon-summary.interface';

export interface TeamPokemonRead {
  id: number;
  slot: number;
  nickname: string | null;
  level: number;
  gender: string | null;
  shiny: boolean;
  pokemon: PokemonSummary;
  teraType: TypeRead | null;
  nature: NatureRead | null;
  heldItem: ItemSummary | null;
  ability: AbilitySummary | null;
  evHp: number;
  evAtk: number;
  evDef: number;
  evSpAtk: number;
  evSpDef: number;
  evSpeed: number;
  ivHp: number;
  ivAtk: number;
  ivDef: number;
  ivSpAtk: number;
  ivSpDef: number;
  ivSpeed: number;
  moves: TeamPokemonMoveEmbed[];
}

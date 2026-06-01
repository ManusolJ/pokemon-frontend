import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { AbilityEmbed } from '@shared/interfaces/pokemon/ability/ability-embed.interface';
import { AbilitySummary } from '@shared/interfaces/pokemon/ability/ability-summary.interface';
import { SpeciesSummary } from '@shared/interfaces/pokemon/pokemon/species-summary.interface';

import { StatSpread } from './stat-spread.interface';

export interface TeamMember {
  readonly pokemonId: number;
  readonly name: string;
  readonly spriteDefault: string;
  readonly spriteShiny: string;
  readonly artwork: string;
  readonly artworkShiny: string;
  readonly primaryType: TypeRead;
  readonly secondaryType: TypeRead | null;
  readonly species: SpeciesSummary;
  readonly availableAbilities: readonly AbilityEmbed[];
  level: number;
  shiny: boolean;
  nickname: string;
  evs: StatSpread;
  ivs: StatSpread;
  item: ItemSummary | null;
  nature: NatureRead | null;
  teraType: TypeRead | null;
  ability: AbilitySummary | null;
  moves: ReadonlyArray<MoveRead | null>;
}

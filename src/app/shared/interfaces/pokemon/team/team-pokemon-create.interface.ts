export interface TeamPokemonCreate {
  pokemonId: number;
  abilityId: number;
  natureId?: number;
  itemId?: number;
  teraTypeId?: number;
  nickname?: string;
  level?: number;
  gender?: string;
  shiny?: boolean;
  evHp?: number;
  evAtk?: number;
  evDef?: number;
  evSpAtk?: number;
  evSpDef?: number;
  evSpeed?: number;
  ivHp?: number;
  ivAtk?: number;
  ivDef?: number;
  ivSpAtk?: number;
  ivSpDef?: number;
  ivSpeed?: number;
  moveIds: number[];
}

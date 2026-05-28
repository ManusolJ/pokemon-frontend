export interface MoveFilter {
  id?: number;
  pokemonId?: number;
  name?: string;
  nameExact?: string;
  typeId?: number;
  category?: string;
  priority?: number;
  minPower?: number;
  maxPower?: number;
  minAccuracy?: number;
  maxAccuracy?: number;
}

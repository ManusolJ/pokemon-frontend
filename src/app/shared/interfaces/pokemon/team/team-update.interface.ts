import { TeamPokemonCreate } from './team-pokemon-create.interface';

export interface TeamUpdate {
  name: string;
  isPublic?: boolean;
  pokemon?: TeamPokemonCreate[];
}

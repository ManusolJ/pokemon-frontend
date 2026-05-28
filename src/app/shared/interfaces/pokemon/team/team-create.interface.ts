import { TeamPokemonCreate } from './team-pokemon-create.interface';

export interface TeamCreate {
  name: string;
  isPublic: boolean;
  pokemon: TeamPokemonCreate[];
}

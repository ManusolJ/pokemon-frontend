import { PokemonType } from '@shared/enums/pokemon-types.enum';

export interface ProfileGroup {
  readonly label: string;
  readonly detail: string;
  readonly types: readonly PokemonType[];
  readonly tone: 'super' | 'resist' | 'immune';
}

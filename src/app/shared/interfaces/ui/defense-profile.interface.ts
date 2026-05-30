import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { ProfileGroup } from './profile-group.interface';

export interface DefenseProfile {
  readonly weaknesses: number;
  readonly immunities: number;
  readonly resistances: number;
  readonly groups: readonly ProfileGroup[];
  readonly neutral: readonly PokemonType[];
}

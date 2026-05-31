import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { MultiplierMeta } from './multiplier-meta.interface';

export interface MatrixCell extends MultiplierMeta {
  readonly defender: PokemonType;
}

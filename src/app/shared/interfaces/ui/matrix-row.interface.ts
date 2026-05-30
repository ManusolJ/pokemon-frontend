import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { MatrixCell } from './matrix-cell.interface';

export interface MatrixRow {
  readonly attacker: PokemonType;
  readonly cells: readonly MatrixCell[];
}

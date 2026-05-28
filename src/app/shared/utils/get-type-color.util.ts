import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { TYPE_COLORS } from '@shared/constants/type-colors.constants';

const FALLBACK_COLOR = '#9CA3AF';

export function getTypeColor(type: string | null | undefined): string {
  if (type) {
    return TYPE_COLORS[type as PokemonType];
  }

  return FALLBACK_COLOR;
}

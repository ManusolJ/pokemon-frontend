import { MoveSummary } from '@shared/models/pokemon/move/move-summary.interface';

export interface TeamPokemonMoveEmbed {
  move: MoveSummary;
  slotPosition: number;
}

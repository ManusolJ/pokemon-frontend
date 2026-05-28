import { MoveSummary } from '@shared/interfaces/pokemon/move/move-summary.interface';

export interface TeamPokemonMoveEmbed {
  move: MoveSummary;
  slotPosition: number;
}

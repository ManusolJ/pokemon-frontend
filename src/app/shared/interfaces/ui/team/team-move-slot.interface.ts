import { MoveSummary } from '@shared/interfaces/pokemon/move/move-summary.interface';

export interface TeamMoveSlot {
  readonly key: number;
  readonly move: MoveSummary | null;
}

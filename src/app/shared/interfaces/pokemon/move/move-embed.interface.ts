import { MoveRead } from './move-read.interface';

export interface MoveEmbed {
  move: MoveRead;
  learnMethod: string;
  levelLearnedAt: number | null;
}

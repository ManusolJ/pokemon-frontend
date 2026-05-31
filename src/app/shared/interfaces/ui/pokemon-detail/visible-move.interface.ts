import { MoveEmbed } from '@shared/interfaces/pokemon/move/move-embed.interface';

export interface VisibleMove {
  readonly entry: MoveEmbed;
  readonly methodKey: 'level' | 'tutor' | 'machine';
  readonly learnLabel: string;
}

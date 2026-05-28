import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

export interface MoveRead {
  id: number;
  name: string;
  type: TypeRead;
  pp: number;
  power: number;
  accuracy: number;
  priority: number;
  category: string;
  effect: string;
  flavorText: string;
  shortEffect: string;
  effectChance: number;
}

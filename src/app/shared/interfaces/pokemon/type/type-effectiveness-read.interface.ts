import { TypeRead } from './type-read.interface';

export interface TypeEffectivenessRead {
  multiplier: number;
  attackingType: TypeRead;
  defendingType: TypeRead;
}

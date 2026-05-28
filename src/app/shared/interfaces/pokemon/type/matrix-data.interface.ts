import { TypeRead } from './type-read.interface';
import { TypeEffectivenessRead } from './type-effectiveness-read.interface';

export interface MatrixData {
  readonly types: TypeRead[];
  readonly cells: Map<string, TypeEffectivenessRead>;
}

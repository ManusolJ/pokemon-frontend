import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

export interface MoveSummary {
  id: number;
  name: string;
  type: TypeRead;
}

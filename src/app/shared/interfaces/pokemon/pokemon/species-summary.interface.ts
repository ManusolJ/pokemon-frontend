import type { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

export interface SpeciesSummary {
  id: number;
  name: string;
  genus: string;
  order: number;
  genderRate: number;
  nationalDexNumber: number;
  spriteDefault: string | null;
  primaryType: TypeRead;
  secondaryType: TypeRead | null;
}

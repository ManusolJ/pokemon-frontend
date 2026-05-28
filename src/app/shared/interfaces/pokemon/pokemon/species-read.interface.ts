import { SpeciesSummary } from './species-summary.interface';

export interface SpeciesRead {
  id: number;
  name: string;
  genus: string;
  order: number;
  nationalDexNumber: number;
  hatchCounter: number;
  flavorText: string;
  catchRate: number;
  growthRate: string;
  genderRate: number;
  generation: number;
  baseHappiness: number;
  isBaby: boolean;
  isMythical: boolean;
  isLegendary: boolean;
  eggGroups: string[];
  previousEvolution: SpeciesSummary | null;
  evolutionItem: string | null;
  evolutionTrigger: string | null;
  evolutionMinLevel: number | null;
  evolutionHeldItem: string | null;
  evolutionTimeOfDay: string | null;
  evolutionMinHappiness: number | null;
}

import { AbilitySummary } from './ability-summary.interface';

export interface AbilityEmbed {
  slot: number;
  isHidden: boolean;
  ability: AbilitySummary;
}

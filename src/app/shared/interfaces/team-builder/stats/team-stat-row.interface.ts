import { StatKey } from './stat-key.interface';
import { StatTone } from './stat-tone.interface';

export interface TeamStatRow {
  readonly key: StatKey;
  readonly label: string;
  readonly total: number;
  readonly average: string;
  readonly fillPercent: number;
  readonly tone: StatTone;
}

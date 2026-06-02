import { StatKey } from './stat-key.interface';

export interface StatMeta {
  readonly label: string;
  readonly short: string;
  readonly key: StatKey;
}

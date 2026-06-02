import { StatKey } from './stat-key.interface';

export interface StatMeta {
  readonly key: StatKey;
  readonly label: string;
  readonly short: string;
}

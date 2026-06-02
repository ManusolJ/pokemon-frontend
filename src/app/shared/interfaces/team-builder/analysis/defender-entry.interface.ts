import { MultiplierBucket } from './multiplier-bucket.interface';

export interface DefenderEntry {
  readonly type: string;
  readonly label: string;
  readonly multiplier: number;
  readonly tone: MultiplierBucket;
}

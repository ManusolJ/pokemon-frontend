import { SegmentTone } from './segment-tone.interface';

export interface AttackerRow {
  readonly type: string;
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
  readonly segments: readonly SegmentTone[];
}

import { StatShape } from './stat-shape.interface';

export interface ClassificationContext {
  readonly item: string;
  readonly shape: StatShape;
  readonly hasSetupMove: boolean;
  readonly hasPivotMove: boolean;
  readonly hasAnyOffense: boolean;
  readonly moves: ReadonlySet<string>;
}

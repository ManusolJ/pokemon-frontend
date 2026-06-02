import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

import { EffectivenessChart } from './effectiveness-chart.interface';

export interface EffectivenessChartLoad {
  readonly chart: EffectivenessChart;
  readonly types: readonly TypeRead[];
}

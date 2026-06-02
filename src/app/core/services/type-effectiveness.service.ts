import { EFFECTIVENESS_MATRIX_PAGE_SIZE } from '@shared/constants/effectiveness.constants';

import { TypeEffectivenessRead } from '@shared/interfaces/pokemon/type/type-effectiveness-read.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';
import { EffectivenessChartLoad } from '@shared/interfaces/team-builder/analysis/effectiveness-chart-load.interface';

import { TypeService } from './type.service';

import { map, Observable, shareReplay } from 'rxjs';

import { inject, Injectable } from '@angular/core';

const CHART_REPLAY_BUFFER_SIZE = 1;

@Injectable({ providedIn: 'root' })
export class TypeEffectivenessService {
  private readonly typeService = inject(TypeService);

  private readonly chart: Observable<EffectivenessChartLoad> = this.typeService
    .getTypeEffectivenessPageWithFilter({}, { page: 0, size: EFFECTIVENESS_MATRIX_PAGE_SIZE })
    .pipe(
      map((response) => this.toChartLoad(response.content)),
      shareReplay({ bufferSize: CHART_REPLAY_BUFFER_SIZE, refCount: false }),
    );

  loadChart(): Observable<EffectivenessChartLoad> {
    return this.chart;
  }

  private toChartLoad(rows: readonly TypeEffectivenessRead[]): EffectivenessChartLoad {
    const seenAttackers = new Set<string>();
    const chart = new Map<string, Map<string, number>>();
    const orderedTypes: TypeEffectivenessRead['attackingType'][] = [];

    for (const row of rows) {
      const attackerKey = row.attackingType.name.toLowerCase();
      const defenderKey = row.defendingType.name.toLowerCase();

      if (!seenAttackers.has(attackerKey)) {
        seenAttackers.add(attackerKey);
        orderedTypes.push(row.attackingType);
      }

      let attackerRow = chart.get(attackerKey);
      if (!attackerRow) {
        attackerRow = new Map<string, number>();
        chart.set(attackerKey, attackerRow);
      }
      attackerRow.set(defenderKey, row.multiplier);
    }

    return {
      chart: chart as EffectivenessChart,
      types: orderedTypes,
    };
  }
}

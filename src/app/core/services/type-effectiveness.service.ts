import { EFFECTIVENESS_MATRIX_PAGE_SIZE } from '@shared/constants/effectiveness.constants';

import { TypeEffectivenessRead } from '@shared/interfaces/pokemon/type/type-effectiveness-read.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';
import { EffectivenessChartLoad } from '@shared/interfaces/team-builder/analysis/effectiveness-chart-load.interface';

import { TypeService } from './type.service';

import { Page } from '@shared/interfaces/api/page.interface';

import { EMPTY, catchError, expand, map, Observable, reduce, shareReplay, throwError } from 'rxjs';

import { inject, Injectable } from '@angular/core';

const CHART_REPLAY_BUFFER_SIZE = 1;

@Injectable({ providedIn: 'root' })
export class TypeEffectivenessService {
  private readonly typeService = inject(TypeService);

  private chart: Observable<EffectivenessChartLoad> | null = null;

  loadChart(): Observable<EffectivenessChartLoad> {
    this.chart ??= this.pageOf(0).pipe(
      expand((page) =>
        page.page.number + 1 < page.page.totalPages ? this.pageOf(page.page.number + 1) : EMPTY,
      ),
      reduce((rows, page) => rows.concat(page.content), [] as TypeEffectivenessRead[]),
      map((rows) => this.toChartLoad(rows)),
      catchError((error: unknown) => {
        this.chart = null;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: CHART_REPLAY_BUFFER_SIZE, refCount: false }),
    );

    return this.chart;
  }

  private pageOf(page: number): Observable<Page<TypeEffectivenessRead>> {
    return this.typeService.getTypeEffectivenessPageWithFilter(
      {},
      {
        page,
        size: EFFECTIVENESS_MATRIX_PAGE_SIZE,
        sort: 'attackingType.id',
        thenSort: ['defendingType.id'],
      },
    );
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

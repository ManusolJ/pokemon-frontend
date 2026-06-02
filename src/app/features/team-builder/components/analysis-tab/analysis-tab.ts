import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';

import { TeamBuilderStateService } from '@core/services/team-builder-state.service';
import { TypeEffectivenessService } from '@core/services/type-effectiveness.service';

import { TeamStats } from '@features/team-builder/components/team-stats/team-stats';
import { RoleSpread } from '@features/team-builder/components/role-spread/role-spread';
import { OffensiveCoverage } from '@features/team-builder/components/offensive-coverage/offensive-coverage';
import { DefensiveCoverage } from '@features/team-builder/components/defensive-coverage/defensive-coverage';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  imports: [OffensiveCoverage, DefensiveCoverage, RoleSpread, TeamStats],
  selector: 'app-analysis-tab',
  styleUrl: './analysis-tab.css',
  templateUrl: './analysis-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisTab {
  private readonly destroyRef = inject(DestroyRef);
  private readonly typeEffectivenessService = inject(TypeEffectivenessService);

  protected readonly teamBuilderStateService = inject(TeamBuilderStateService);

  private readonly _types = signal<readonly TypeRead[]>([]);
  private readonly _chart = signal<EffectivenessChart>(new Map());

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly types = this._types.asReadonly();
  protected readonly chart = this._chart.asReadonly();
  protected readonly members = this.teamBuilderStateService.members;

  protected readonly hasTeam = computed(() => this.members().some((member) => member !== null));

  constructor() {
    this.typeEffectivenessService
      .loadChart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ chart, types }) => {
          this._chart.set(chart);
          this._types.set(types);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}

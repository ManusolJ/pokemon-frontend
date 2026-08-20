import {
  FilterField,
  FilterValue,
  FilterOption,
} from '@shared/interfaces/ui/filter/filter-field.interface';
import { PokemonFilter } from '@shared/interfaces/pokemon/pokemon/pokemon-filter.interface';
import { SpeciesSummary } from '@shared/interfaces/pokemon/pokemon/species-summary.interface';

import { TypeService } from '@core/services/type.service';
import { SpeciesService } from '@core/services/species.service';

import { ListShell } from '@shared/components/list-shell/list-shell';
import { PokemonCard } from '@shared/components/pokemon-card/pokemon-card';
import { FilterSidebar } from '@shared/components/filter-sidebar/filter-sidebar';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import {
  OnInit,
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';

const PAGE_SIZE = 21;

type SpeciesSortField = 'nationalDexNumber' | 'name' | 'sortOrder';

const GENERATIONS: FilterOption[] = [
  { label: 'Gen I', value: 1 },
  { label: 'Gen II', value: 2 },
  { label: 'Gen III', value: 3 },
  { label: 'Gen IV', value: 4 },
  { label: 'Gen V', value: 5 },
  { label: 'Gen VI', value: 6 },
  { label: 'Gen VII', value: 7 },
  { label: 'Gen VIII', value: 8 },
  { label: 'Gen IX', value: 9 },
];

@Component({
  imports: [ListShell, FilterSidebar, PokemonCard],
  selector: 'app-pokemon-list',
  styleUrl: './pokemon-list.css',
  templateUrl: './pokemon-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonList implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly typeService = inject(TypeService);
  private readonly speciesService = inject(SpeciesService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loading = signal(false);

  protected readonly items = signal<SpeciesSummary[]>([]);
  protected readonly sort = signal<SpeciesSortField>('sortOrder');

  protected readonly sorts: readonly { field: SpeciesSortField; label: string }[] = [
    { field: 'name', label: 'Name' },
    { field: 'sortOrder', label: 'Family' },
    { field: 'nationalDexNumber', label: 'Dex º' },
  ];

  private readonly typeOptions = signal<FilterOption[]>([]);

  readonly pageSize = PAGE_SIZE;

  protected readonly fields = computed<FilterField[]>(() => [
    { kind: 'search', key: 'name', label: 'Search', placeholder: 'Search Pokemon' },
    {
      kind: 'chips',
      key: 'typeIds',
      label: 'Type',
      multi: true,
      maxSelections: 2,
      options: this.typeOptions(),
    },
    {
      kind: 'select',
      key: 'generation',
      label: 'Generation',
      placeholder: 'Any generation',
      options: GENERATIONS,
    },
    { kind: 'toggle', key: 'isBaby', label: 'Baby only' },
    { kind: 'toggle', key: 'isMythical', label: 'Mythical only' },
    { kind: 'toggle', key: 'isLegendary', label: 'Legendary only' },
    { kind: 'toggle', key: 'isGenderless', label: 'Genderless only' },
    { kind: 'toggle', key: 'hasPreviousEvolution', label: 'Has pre-evolution' },
    { kind: 'toggle', key: 'evolvesWithItem', label: 'Evolves with item' },
    { kind: 'toggle', key: 'evolvesWithLevelUp', label: 'Evolves by level-up' },
    {
      kind: 'range',
      label: 'Base HP',
      minKey: 'minBaseHp',
      maxKey: 'maxBaseHp',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Base Attack',
      minKey: 'minBaseAtk',
      maxKey: 'maxBaseAtk',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Base Defense',
      minKey: 'minBaseDef',
      maxKey: 'maxBaseDef',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Base Special Attack',
      minKey: 'minBaseSpAtk',
      maxKey: 'maxBaseSpAtk',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Base Special Defense',
      minKey: 'minBaseSpDef',
      maxKey: 'maxBaseSpDef',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Base Speed',
      minKey: 'minBaseSpeed',
      maxKey: 'maxBaseSpeed',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Height (m)',
      minKey: 'minHeight',
      maxKey: 'maxHeight',
      min: 0,
      step: 0.1,
    },
    {
      kind: 'range',
      label: 'Weight (kg)',
      minKey: 'minWeight',
      maxKey: 'maxWeight',
      min: 0,
      step: 0.1,
    },
    {
      kind: 'range',
      label: 'Gender rate',
      minKey: 'minGenderRate',
      maxKey: 'maxGenderRate',
      min: 0,
      max: 8,
    },
    {
      kind: 'range',
      label: 'Base happiness',
      minKey: 'minBaseHappiness',
      maxKey: 'maxBaseHappiness',
      min: 0,
      max: 255,
    },
    {
      kind: 'range',
      label: 'Evolution level',
      minKey: 'minEvolutionLevel',
      maxKey: 'maxEvolutionLevel',
      min: 1,
      max: 100,
    },
  ]);

  private filter: PokemonFilter = {};

  private readonly reload = new Subject<void>();

  ngOnInit(): void {
    this.loadTypes();
    this.subscribeToReloads();
    this.load();
  }

  protected onFilterChange(applied: Record<string, FilterValue>): void {
    this.filter = this.toBackendUnits(applied as PokemonFilter);
    this.page.set(0);
    this.load();
  }

  /**
   * Backend stores weight in hectograms (1 kg = 10 hg) and height in decimeters
   * (1 m = 10 dm). The UI takes kg / m, so convert here before sending.
   */
  private toBackendUnits(filter: PokemonFilter): PokemonFilter {
    const KG_TO_HG = 10;
    const M_TO_DM = 10;
    const out: PokemonFilter = { ...filter };

    if (out.minWeight != null) out.minWeight = Math.round(out.minWeight * KG_TO_HG);
    if (out.maxWeight != null) out.maxWeight = Math.round(out.maxWeight * KG_TO_HG);
    if (out.minHeight != null) out.minHeight = Math.round(out.minHeight * M_TO_DM);
    if (out.maxHeight != null) out.maxHeight = Math.round(out.maxHeight * M_TO_DM);

    return out;
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
    this.load();
  }

  protected setSort(field: SpeciesSortField): void {
    if (this.sort() === field) {
      return;
    }
    this.sort.set(field);
    this.page.set(0);
    this.load();
  }

  protected onSelect(id: number): void {
    this.router.navigate([`pokedex/pokemon/${id}`]);
  }

  private load(): void {
    this.reload.next();
  }

  private subscribeToReloads(): void {
    this.reload
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() =>
          this.speciesService
            .getSpeciesSummaryPageWithFilter(this.filter, {
              page: this.page(),
              size: PAGE_SIZE,
              sort: this.sort(),
              direction: 'ASC',
            })
            .pipe(
              catchError(() => {
                this.loading.set(false);
                return EMPTY;
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.items.set(res.content);
        this.total.set(res.page.totalElements);
        this.totalPages.set(res.page.totalPages);
        this.loading.set(false);
      });
  }

  private loadTypes(): void {
    this.typeService
      .getTypePageWithFilter({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) =>
          this.typeOptions.set(
            res.content.map((type) => ({
              label: type.name,
              value: type.id,
              color: getTypeColor(type.name),
            })),
          ),
      });
  }
}

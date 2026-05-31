import {
  FilterField,
  FilterValue,
  FilterOption,
} from '@shared/interfaces/ui/filter/filter-field.interface';
import { TypeFilter } from '@shared/interfaces/pokemon/type/type-filter.interface';
import { MoveFilter } from '@shared/interfaces/pokemon/move/move-filter.interface';
import { MoveSummary } from '@shared/interfaces/pokemon/move/move-summary.interface';

import { TypeService } from '@core/services/type.service';
import { MoveService } from '@core/services/move.service';

import { ListShell } from '@shared/components/list-shell/list-shell';
import { TypeBadge } from '@shared/components/type-badge/type-badge';
import { FilterSidebar } from '@shared/components/filter-sidebar/filter-sidebar';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { TitleCasePipe } from '@angular/common';
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
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';

const PAGE_SIZE = 42;

const CATEGORIES: FilterOption[] = [
  { label: 'Status', value: 'status' },
  { label: 'Special', value: 'special' },
  { label: 'Physical', value: 'physical' },
];

@Component({
  selector: 'app-move-list',
  imports: [ListShell, FilterSidebar, TypeBadge, NameNormalizerPipe, TitleCasePipe],
  templateUrl: './move-list.html',
  styleUrl: './move-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveList implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly moveService = inject(MoveService);
  private readonly typeService = inject(TypeService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loading = signal(false);
  protected readonly items = signal<MoveSummary[]>([]);

  private readonly reload = new Subject<void>();
  private readonly typeOptions = signal<FilterOption[]>([]);

  readonly skeletonCount = PAGE_SIZE;

  protected readonly fields = computed<FilterField[]>(() => [
    { kind: 'search', key: 'name', label: 'Search', placeholder: 'Search moves' },
    { kind: 'chips', key: 'typeId', label: 'Type', options: this.typeOptions() },
    {
      kind: 'select',
      key: 'category',
      label: 'Category',
      placeholder: 'Any category',
      options: CATEGORIES,
    },
    { kind: 'range', label: 'Power', minKey: 'minPower', maxKey: 'maxPower', min: 0, max: 250 },
    {
      kind: 'range',
      label: 'Accuracy',
      minKey: 'minAccuracy',
      maxKey: 'maxAccuracy',
      min: 0,
      max: 100,
    },
  ]);

  private filter: MoveFilter = {};

  ngOnInit(): void {
    this.loadTypes();
    this.subscribeToReloads();
    this.load();
  }

  protected onFilterChange(applied: Record<string, FilterValue>): void {
    this.filter = applied as MoveFilter;
    this.page.set(0);
    this.load();
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
    this.load();
  }

  protected onSelect(id: number): void {
    this.router.navigate([`pokedex/moves/${id}`]);
  }

  private load(): void {
    this.reload.next();
  }

  private subscribeToReloads(): void {
    this.reload
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() =>
          this.moveService
            .getMoveSummaryPageWithFilter(this.filter, {
              page: this.page(),
              size: PAGE_SIZE,
              sort: 'name',
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
    const filter: TypeFilter = {
      id: null,
      name: '',
      nameExact: '',
    };

    this.typeService
      .getTypePageWithFilter(filter)
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

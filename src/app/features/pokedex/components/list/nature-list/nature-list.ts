import {
  FilterField,
  FilterValue,
  FilterOption,
} from '@shared/interfaces/ui/filter/filter-field.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { NatureFilter } from '@shared/interfaces/pokemon/nature/nature-filter.interface';

import { NatureService } from '@core/services/nature.service';

import { ListShell } from '@shared/components/list-shell/list-shell';
import { FilterSidebar } from '@shared/components/filter-sidebar/filter-sidebar';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

const PAGE_SIZE = 25;

const STATS: FilterOption[] = [
  { label: 'Attack', value: 'attack' },
  { label: 'Defense', value: 'defense' },
  { label: 'Sp. Attack', value: 'special-attack' },
  { label: 'Sp. Defense', value: 'special-defense' },
  { label: 'Speed', value: 'speed' },
];

//TODO: Remove underscore from natures with two words.
@Component({
  imports: [ListShell, FilterSidebar],
  selector: 'app-nature-list',
  styleUrl: './nature-list.css',
  templateUrl: './nature-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NatureList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly natureService = inject(NatureService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loading = signal(false);
  protected readonly items = signal<NatureRead[]>([]);

  protected readonly fields: FilterField[] = [
    { kind: 'search', key: 'name', label: 'Search', placeholder: 'Search natures' },
    {
      kind: 'select',
      key: 'increasedStat',
      label: 'Increases',
      placeholder: 'Any stat',
      options: STATS,
    },
    {
      kind: 'select',
      key: 'decreasedStat',
      label: 'Decreases',
      placeholder: 'Any stat',
      options: STATS,
    },
  ];

  readonly pageSize = PAGE_SIZE;

  private filter: NatureFilter = {};

  private readonly reload = new Subject<void>();

  ngOnInit(): void {
    this.subscribeToReloads();
    this.load();
  }

  protected onFilterChange(applied: Record<string, FilterValue>): void {
    this.filter = applied as NatureFilter;
    this.page.set(0);
    this.load();
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
    this.load();
  }

  protected isNeutral(nature: NatureRead): boolean {
    return nature.increasedStat === nature.decreasedStat;
  }

  private load(): void {
    this.reload.next();
  }

  private subscribeToReloads(): void {
    this.reload
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() =>
          this.natureService
            .getNaturePageWithFilter(this.filter, {
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
}

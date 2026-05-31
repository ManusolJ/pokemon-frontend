import { FilterField, FilterValue } from '@shared/interfaces/ui/filter/filter-field.interface';
import { AbilityRead } from '@shared/interfaces/pokemon/ability/ability-read.interface';
import { AbilityFilter } from '@shared/interfaces/pokemon/ability/ability-filter.interface';

import { AbilityService } from '@core/services/ability.service';

import { ListShell } from '@shared/components/list-shell/list-shell';
import { FilterSidebar } from '@shared/components/filter-sidebar/filter-sidebar';

import {
  inject,
  OnInit,
  signal,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';

const PAGE_SIZE = 30;

@Component({
  imports: [ListShell, FilterSidebar],
  selector: 'app-ability-list',
  styleUrl: './ability-list.css',
  templateUrl: './ability-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbilityList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly abilityService = inject(AbilityService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loading = signal(false);
  protected readonly items = signal<AbilityRead[]>([]);

  protected readonly fields: FilterField[] = [
    { kind: 'search', key: 'name', label: 'Search', placeholder: 'Search abilities' },
  ];

  private filter: AbilityFilter = {};

  private readonly reload = new Subject<void>();

  readonly skeletonCount = PAGE_SIZE;

  ngOnInit(): void {
    this.subscribeToReloads();
    this.load();
  }

  protected onFilterChange(applied: Record<string, FilterValue>): void {
    this.filter = applied as AbilityFilter;
    this.page.set(0);
    this.load();
  }

  protected onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
    this.load();
  }

  private load(): void {
    this.reload.next();
  }

  private subscribeToReloads(): void {
    this.reload
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() =>
          this.abilityService
            .getAbilityPageWithFilter(this.filter, {
              page: this.page(),
              size: PAGE_SIZE,
              sort: 'id',
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

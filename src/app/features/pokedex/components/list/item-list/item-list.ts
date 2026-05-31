import { environment } from '@environments/environment';

import { ItemRead } from '@shared/interfaces/pokemon/item/item-read.interface';
import { ItemFilter } from '@shared/interfaces/pokemon/item/item-filter.interface';
import { FilterField, FilterValue } from '@shared/interfaces/ui/filter/filter-field.interface';

import { ItemService } from '@core/services/item.service';

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

const PAGE_SIZE = 25;

@Component({
  imports: [ListShell, FilterSidebar],
  selector: 'app-item-list',
  styleUrl: './item-list.css',
  templateUrl: './item-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly itemService = inject(ItemService);

  protected readonly page = signal(0);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loading = signal(false);
  protected readonly items = signal<ItemRead[]>([]);

  protected readonly fields: FilterField[] = [
    { kind: 'search', key: 'name', label: 'Search', placeholder: 'Search items' },
  ];

  readonly skeletonCount = PAGE_SIZE;

  private filter: ItemFilter = {};

  private readonly reload = new Subject<void>();

  ngOnInit(): void {
    this.subscribeToReloads();
    this.load();
  }

  protected getItemSpriteUrl(item: ItemRead) {
    return item.spriteUrl ? `${environment.spritesBaseUrl}${item.spriteUrl}` : '';
  }

  protected onFilterChange(applied: Record<string, FilterValue>): void {
    this.filter = applied as ItemFilter;
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
          this.itemService
            .getItemPageWithFilter(this.filter, {
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

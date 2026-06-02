import { environment } from '@environments/environment';

import { ItemRead } from '@shared/interfaces/pokemon/item/item-read.interface';

import { ItemService } from '@core/services/item.service';

import { Modal } from '@shared/components/modal/modal';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { TitleCasePipe } from '@angular/common';

import { map, of, tap } from 'rxjs';

import { rxResource } from '@angular/core/rxjs-interop';
import {
  effect,
  input,
  inject,
  output,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  imports: [Modal, NameNormalizerPipe, TitleCasePipe, PaginatorModule, SkeletonModule],
  selector: 'app-item-picker',
  styleUrl: './item-picker.css',
  templateUrl: './item-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemPicker {
  private readonly itemService = inject(ItemService);

  readonly open = input.required<boolean>();
  readonly currentItemId = input<number | null>(null);

  readonly closed = output<void>();
  readonly picked = output<ItemRead | null>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  protected readonly query = signal('');
  protected readonly currentPage = signal(0);
  protected readonly totalRecords = signal(0);

  private readonly debouncedQuery = signal('');
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly itemsResource = rxResource({
    params: () => ({
      open: this.open(),
      query: this.debouncedQuery(),
      page: this.currentPage(),
    }),
    stream: ({ params }) => {
      if (!params.open) {
        return of<ItemRead[]>([]);
      }
      return this.itemService
        .getItemPageWithFilter(
          { name: params.query.trim() || undefined },
          { page: params.page, size: PAGE_SIZE, sort: 'name', direction: 'ASC' },
        )
        .pipe(
          tap((response) => this.totalRecords.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly items = computed(() => this.itemsResource.value());
  protected readonly loading = computed(() => this.itemsResource.isLoading());
  protected readonly hasFilters = computed(() => this.query().trim().length > 0);

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.resetFilters();
      }
    });
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedQuery.set(value);
      this.currentPage.set(0);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected onPageChange(state: PaginatorState): void {
    this.currentPage.set(state.page ?? 0);
  }

  protected isCurrent(item: ItemRead): boolean {
    return this.currentItemId() === item.id;
  }

  protected onPick(item: ItemRead): void {
    this.picked.emit(item);
  }

  protected clearItem(): void {
    this.picked.emit(null);
  }

  protected clearFilters(): void {
    this.resetFilters();
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }

  private resetFilters(): void {
    clearTimeout(this.searchDebounceTimer);
    this.query.set('');
    this.debouncedQuery.set('');
    this.currentPage.set(0);
  }
}

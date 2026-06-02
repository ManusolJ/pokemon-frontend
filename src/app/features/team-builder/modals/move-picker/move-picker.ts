import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { CategoryMeta } from '@shared/interfaces/team-builder/category-meta.interface';
import { MoveCategoryKey } from '@shared/interfaces/ui/move-detail/move-category-key.interface';

import { MoveService } from '@core/services/move.service';
import { TypeService } from '@core/services/type.service';

import { Modal } from '@shared/components/modal/modal';
import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { map, of, switchMap, tap } from 'rxjs';

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

type MoveSort = 'default' | 'power' | 'name';
type MoveCategoryFilter = 'all' | MoveCategoryKey;

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_CATEGORY_KEY: MoveCategoryKey = 'status';

const CATEGORY_META: Record<MoveCategoryKey, CategoryMeta> = {
  physical: { abbr: 'PHY', class: 'move__cat--phys' },
  special: { abbr: 'SPC', class: 'move__cat--spec' },
  status: { abbr: 'STA', class: 'move__cat--stat' },
};

const SORT_OPTIONS: ReadonlyArray<{ readonly id: MoveSort; readonly label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'power', label: 'Power' },
  { id: 'name', label: 'A–Z' },
];

const CATEGORY_OPTIONS: ReadonlyArray<{ readonly id: MoveCategoryFilter; readonly label: string }> =
  [
    { id: 'all', label: 'All' },
    { id: 'physical', label: 'Phys' },
    { id: 'special', label: 'Spec' },
    { id: 'status', label: 'Status' },
  ];

@Component({
  imports: [Modal, TypeBadge, PaginatorModule, SkeletonModule],
  selector: 'app-move-picker',
  styleUrl: './move-picker.css',
  templateUrl: './move-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovePicker {
  private readonly moveService = inject(MoveService);
  private readonly typeService = inject(TypeService);

  readonly open = input.required<boolean>();
  readonly pokemonId = input<number | null>(null);
  readonly currentMove = input<MoveRead | null>(null);
  readonly disabledMoveIds = input<readonly number[]>([]);

  readonly closed = output<void>();
  readonly picked = output<MoveRead | null>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  protected readonly query = signal('');
  protected readonly typeId = signal<number | null>(null);

  protected readonly sort = signal<MoveSort>('default');
  protected readonly category = signal<MoveCategoryFilter>('all');

  protected readonly currentPage = signal(0);
  protected readonly totalRecords = signal(0);

  private readonly debouncedQuery = signal('');
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly typesResource = rxResource({
    stream: () =>
      this.typeService
        .getTypeCountWithFilter({})
        .pipe(
          switchMap((count) =>
            count === 0
              ? of<readonly TypeRead[]>([])
              : this.typeService
                  .getTypePageWithFilter(
                    {},
                    { page: 0, size: count, sort: 'name', direction: 'ASC' },
                  )
                  .pipe(map((page) => page.content)),
          ),
        ),
    defaultValue: [],
  });

  private readonly movesResource = rxResource({
    params: () => ({
      open: this.open(),
      pokemonId: this.pokemonId(),
      query: this.debouncedQuery(),
      typeId: this.typeId(),
      category: this.category(),
      sort: this.sort(),
      page: this.currentPage(),
    }),
    stream: ({ params }) => {
      if (!params.open || params.pokemonId == null) {
        return of<MoveRead[]>([]);
      }
      const sortParam = params.sort === 'default' ? 'id' : params.sort;
      return this.moveService
        .getMovePageWithFilter(
          {
            pokemonId: params.pokemonId,
            name: params.query.trim() || undefined,
            typeId: params.typeId ?? undefined,
            category: params.category === 'all' ? undefined : params.category,
          },
          { page: params.page, size: PAGE_SIZE, sort: sortParam, direction: 'ASC' },
        )
        .pipe(
          tap((response) => this.totalRecords.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly types = computed(() => this.typesResource.value());
  protected readonly moves = computed(() => this.movesResource.value());
  protected readonly loading = computed(() => this.movesResource.isLoading());
  protected readonly disabledSet = computed(() => new Set(this.disabledMoveIds()));

  protected readonly hasFilters = computed(
    () =>
      this.query().trim().length > 0 ||
      this.typeId() !== null ||
      this.category() !== 'all' ||
      this.sort() !== 'default',
  );

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.resetFilters();
      }
    });
  }

  protected typeColor(name: string | undefined): string {
    return getTypeColor(name);
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedQuery.set(value);
      this.currentPage.set(0);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected toggleType(id: number): void {
    this.typeId.set(this.typeId() === id ? null : id);
    this.currentPage.set(0);
  }

  protected setCategory(category: MoveCategoryFilter): void {
    this.category.set(category);
    this.currentPage.set(0);
  }

  protected setSort(sort: MoveSort): void {
    this.sort.set(sort);
    this.currentPage.set(0);
  }

  protected onPageChange(state: PaginatorState): void {
    this.currentPage.set(state.page ?? 0);
  }

  protected categoryAbbr(category: string): string {
    return this.categoryMeta(category).abbr;
  }

  protected categoryClass(category: string): string {
    return this.categoryMeta(category).class;
  }

  protected isCurrent(move: MoveRead): boolean {
    return this.currentMove()?.id === move.id;
  }

  protected onPick(move: MoveRead): void {
    if (!this.isCurrent(move) && this.disabledSet().has(move.id)) return;
    this.picked.emit(move);
  }

  protected clear(): void {
    this.picked.emit(null);
  }

  protected clearFilters(): void {
    this.resetFilters();
  }

  private categoryMeta(category: string | undefined): CategoryMeta {
    const key = (category?.toLowerCase() ?? DEFAULT_CATEGORY_KEY) as MoveCategoryKey;
    return CATEGORY_META[key] ?? CATEGORY_META[DEFAULT_CATEGORY_KEY];
  }

  private resetFilters(): void {
    clearTimeout(this.searchDebounceTimer);
    this.query.set('');
    this.typeId.set(null);
    this.currentPage.set(0);
    this.category.set('all');
    this.sort.set('default');
    this.debouncedQuery.set('');
  }
}

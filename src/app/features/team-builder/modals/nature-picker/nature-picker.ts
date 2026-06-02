import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { SearchableOption } from '@shared/interfaces/ui/generic/searchable-option.interface';

import { NatureService } from '@core/services/nature.service';

import { Modal } from '@shared/components/modal/modal';

import { TitleCasePipe } from '@angular/common';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

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

const STAT_OPTIONS: readonly SearchableOption[] = [
  { label: 'Attack', value: 'attack' },
  { label: 'Defense', value: 'defense' },
  { label: 'Sp. Atk', value: 'special-attack' },
  { label: 'Sp. Def', value: 'special-defense' },
  { label: 'Speed', value: 'speed' },
];

const STAT_LABEL_BY_KEY: Readonly<Record<string, string>> = {
  ATTACK: 'Attack',
  DEFENSE: 'Defense',
  SPECIAL_ATTACK: 'Sp. Atk',
  SPECIAL_DEFENSE: 'Sp. Def',
  SPEED: 'Speed',
};

@Component({
  imports: [Modal, TitleCasePipe, PaginatorModule, SkeletonModule],
  selector: 'app-nature-picker',
  styleUrl: './nature-picker.css',
  templateUrl: './nature-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturePicker {
  private readonly natureService = inject(NatureService);

  readonly open = input.required<boolean>();
  readonly currentNatureId = input<number | null>(null);

  readonly closed = output<void>();
  readonly picked = output<NatureRead | null>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly statOptions = STAT_OPTIONS;
  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  protected readonly currentPage = signal(0);
  protected readonly totalRecords = signal(0);

  protected readonly query = signal('');
  protected readonly increasedStat = signal<string | null>(null);
  protected readonly decreasedStat = signal<string | null>(null);

  private readonly debouncedQuery = signal('');
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly naturesResource = rxResource({
    params: () => ({
      open: this.open(),
      query: this.debouncedQuery(),
      increased: this.increasedStat(),
      decreased: this.decreasedStat(),
      page: this.currentPage(),
    }),
    stream: ({ params }) => {
      if (!params.open) {
        return of<NatureRead[]>([]);
      }
      return this.natureService
        .getNaturePageWithFilter(
          {
            name: params.query.trim() || undefined,
            increasedStat: params.increased ?? undefined,
            decreasedStat: params.decreased ?? undefined,
          },
          { page: params.page, size: PAGE_SIZE, sort: 'name', direction: 'ASC' },
        )
        .pipe(
          tap((response) => this.totalRecords.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly natures = computed(() => this.naturesResource.value());
  protected readonly loading = computed(() => this.naturesResource.isLoading());
  protected readonly hasFilters = computed(
    () =>
      this.query().trim().length > 0 ||
      this.increasedStat() !== null ||
      this.decreasedStat() !== null,
  );

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

  protected toggleIncreased(value: SearchableOption['value']): void {
    const next = String(value);
    this.increasedStat.set(this.increasedStat() === next ? null : next);
    this.currentPage.set(0);
  }

  protected toggleDecreased(value: SearchableOption['value']): void {
    const next = String(value);
    this.decreasedStat.set(this.decreasedStat() === next ? null : next);
    this.currentPage.set(0);
  }

  protected onPageChange(state: PaginatorState): void {
    this.currentPage.set(state.page ?? 0);
  }

  protected isCurrent(nature: NatureRead): boolean {
    return this.currentNatureId() === nature.id;
  }

  protected isNeutral(nature: NatureRead): boolean {
    return nature.increasedStat === nature.decreasedStat;
  }

  protected statLabel(rawStat: string): string {
    return STAT_LABEL_BY_KEY[rawStat] ?? rawStat;
  }

  protected onPick(nature: NatureRead): void {
    this.picked.emit(nature);
  }

  protected clearNature(): void {
    this.picked.emit(null);
  }

  protected clearFilters(): void {
    this.resetFilters();
  }

  private resetFilters(): void {
    clearTimeout(this.searchDebounceTimer);
    this.query.set('');
    this.debouncedQuery.set('');
    this.increasedStat.set(null);
    this.decreasedStat.set(null);
    this.currentPage.set(0);
  }
}

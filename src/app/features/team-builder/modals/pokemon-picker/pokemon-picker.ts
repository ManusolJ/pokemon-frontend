import { spriteUrl } from '@shared/utils/sprite-url.util';

import { debouncedText } from '@shared/utils/debounced-text.util';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { PokemonSummary } from '@shared/interfaces/pokemon/pokemon/pokemon-summary.interface';

import { TypeService } from '@core/services/type.service';
import { PokemonService } from '@core/services/pokemon.service';

import { Modal } from '@shared/components/modal/modal';
import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import {
  input,
  effect,
  output,
  signal,
  inject,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { map, of, tap } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

const PAGE_SIZE = 27;

@Component({
  imports: [Modal, TypeBadge, NameNormalizerPipe, PaginatorModule, SkeletonModule],
  selector: 'app-pokemon-picker',
  styleUrl: './pokemon-picker.css',
  templateUrl: './pokemon-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonPicker {
  private readonly destroyRef = inject(DestroyRef);
  private readonly typeService = inject(TypeService);
  private readonly pokemonService = inject(PokemonService);

  readonly open = input.required<boolean>();

  readonly closed = output<void>();
  readonly picked = output<PokemonRead>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  protected readonly currentPage = signal(0);
  protected readonly totalRecords = signal(0);

  private readonly searchText = debouncedText(() => this.currentPage.set(0));
  protected readonly query = this.searchText.live;
  protected readonly typeId = signal<number | null>(null);

  private readonly debouncedQuery = this.searchText.settled;

  private readonly typesResource = rxResource({
    stream: () => this.typeService.getAllTypes(),
    defaultValue: [],
  });

  private readonly pokemonResource = rxResource({
    params: () => ({
      open: this.open(),
      query: this.debouncedQuery(),
      typeId: this.typeId(),
      page: this.currentPage(),
    }),
    stream: ({ params }) => {
      if (!params.open) {
        return of<PokemonSummary[]>([]);
      }
      return this.pokemonService
        .getPokemonSummaryPageWithFilter(
          {
            typeIds: params.typeId == null ? undefined : [params.typeId],
            name: params.query.trim() || undefined,
          },
          {
            page: params.page,
            size: PAGE_SIZE,
            sort: 'sortOrder',
            direction: 'ASC',
          },
        )
        .pipe(
          tap((response) => this.totalRecords.set(response.page.totalElements)),
          map((response) => response.content),
        );
    },
    defaultValue: [],
  });

  protected readonly types = computed(() => this.typesResource.value());
  protected readonly pokemon = computed(() => this.pokemonResource.value());
  protected readonly loading = computed<boolean>(() => this.pokemonResource.isLoading());

  protected readonly hasFilters = computed(
    () => this.query().trim().length > 0 || this.typeId() !== null,
  );

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.resetFilters();
      }
    });
  }

  protected clearFilters(): void {
    this.resetFilters();
  }

  private resetFilters(): void {
    this.searchText.reset();
    this.typeId.set(null);
    this.currentPage.set(0);
  }

  protected onSearch(value: string): void {
    this.searchText.set(value);
  }

  protected toggleType(id: number): void {
    this.typeId.set(this.typeId() === id ? null : id);
    this.currentPage.set(0);
  }

  protected onPageChange(state: PaginatorState): void {
    this.currentPage.set(state.page ?? 0);
  }

  protected getTypeColor(name: string): string {
    return getTypeColor(name);
  }

  protected typesOf(pokemon: PokemonSummary): TypeRead[] {
    return [pokemon.primaryType, pokemon.secondaryType].filter((type): type is TypeRead => !!type);
  }

  protected onPick(pick: PokemonSummary): void {
    this.pokemonService
      .getOnePokemon({ id: pick.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.picked.emit(result),
        error: () => {},
      });
  }

  protected getImgUrl(url: string): string {
    return spriteUrl(url);
  }
}

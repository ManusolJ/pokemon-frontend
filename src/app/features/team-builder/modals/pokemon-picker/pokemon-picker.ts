import { environment } from '@environments/environment';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { PokemonSummary } from '@shared/interfaces/pokemon/pokemon/pokemon-summary.interface';

import { PokemonService } from '@core/services/pokemon.service';
import { TypeService } from '@core/services/type.service';

import { Modal } from '@shared/components/modal/modal';
import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import {
  input,
  output,
  signal,
  inject,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import { map, of, switchMap, tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

const PAGE_SIZE = 27;

//TODO: Cleanup logic. Add debouncing. Revise for CLEAN CODE and DRY.
//TODO: Cleanup CSS.
@Component({
  imports: [Modal, TypeBadge, NameNormalizerPipe, PaginatorModule, SkeletonModule],
  selector: 'app-pokemon-picker',
  styleUrl: './pokemon-picker.css',
  templateUrl: './pokemon-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonPicker {
  private readonly typeService = inject(TypeService);
  private readonly pokemonService = inject(PokemonService);

  protected readonly skeletons = computed<readonly void[]>(() => Array.from({ length: PAGE_SIZE }));

  readonly open = input.required<boolean>();

  readonly closed = output<void>();
  readonly picked = output<PokemonRead>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly currentPage = signal(0);
  protected readonly totalRecords = signal(0);

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

  private readonly pokemonResource = rxResource({
    params: () => (this.query() || this.typeId() || this.currentPage()) && this.open(),
    stream: () =>
      this.pokemonService
        .getPokemonSummaryPageWithFilter(
          {
            primaryTypeId: this.typeId() ?? undefined,
            name: this.query(),
          },
          {
            page: this.currentPage(),
            size: PAGE_SIZE,
            sort: 'sortOrder',
            direction: 'ASC',
          },
        )
        .pipe(
          tap((page) => this.totalRecords.set(page.page.totalElements)),
          map((page) => page.content),
        ),
    defaultValue: [],
  });

  protected readonly loading = computed<boolean>(() => this.pokemonResource.isLoading());

  protected readonly query = signal('');
  protected readonly typeId = signal<number | null>(null);

  protected readonly types = computed(() => this.typesResource.value());
  protected readonly pokemon = computed(() => this.pokemonResource.value());

  protected onSearch(raw: string): void {
    this.query.set(raw);
    this.currentPage.set(0);
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
    return [pokemon.primaryType, pokemon.secondaryType].filter((t): t is TypeRead => !!t);
  }

  protected onPick(pick: PokemonSummary): void {
    this.pokemonService.getOnePokemon({ id: pick.id }).subscribe({
      next: (result) => this.picked.emit(result),
      error: () => {},
    });
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }
}

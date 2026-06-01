import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';

import { MoveService } from '@core/services/move.service';

import { Modal } from '@shared/components/modal/modal';
import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { map } from 'rxjs';

import { rxResource } from '@angular/core/rxjs-interop';
import {
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
type MoveCategoryKey = 'physical' | 'special' | 'status';

interface CategoryMeta {
  readonly abbr: string;
  readonly class: string;
}

const PAGE_SIZE = 60;
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
  imports: [Modal, TypeBadge],
  selector: 'app-move-picker',
  styleUrl: './move-picker.css',
  templateUrl: './move-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovePicker {
  private readonly moveService = inject(MoveService);

  readonly open = input.required<boolean>();
  readonly pokemonId = input<number | null>(null);
  readonly currentMove = input<MoveRead | null>(null);
  readonly disabledMoveIds = input<readonly number[]>([]);

  readonly closed = output<void>();
  readonly picked = output<MoveRead | null>();

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;

  protected readonly query = signal('');
  protected readonly sort = signal<MoveSort>('default');
  protected readonly typeId = signal<number | null>(null);
  protected readonly category = signal<MoveCategoryFilter>('all');

  private readonly moveResource = rxResource({
    params: () => {
      if (!this.open()) {
        return undefined;
      }
      const id = this.pokemonId();
      return id == null ? undefined : { pokemonId: id };
    },
    stream: ({ params }) =>
      this.moveService
        .getMovePageWithFilter(
          { pokemonId: params.pokemonId },
          { page: 0, size: PAGE_SIZE, sort: 'id', direction: 'ASC' },
        )
        .pipe(map((page) => page.content)),
    defaultValue: [],
  });

  protected readonly pool = computed(() => this.moveResource.value());
  protected readonly loading = computed(() => this.moveResource.isLoading());

  protected readonly disabledSet = computed(() => new Set(this.disabledMoveIds()));

  protected readonly visible = computed<readonly MoveRead[]>(() => {
    const query = this.query().trim().toLowerCase();
    const typeId = this.typeId();
    const category = this.category();
    let list = this.pool().filter((move) => {
      if (query && !move.name.toLowerCase().includes(query)) {
        return false;
      }
      if (typeId !== null && move.type?.id !== typeId) {
        return false;
      }
      if (category !== 'all' && move.category?.toLowerCase() !== category) {
        return false;
      }
      return true;
    });
    const sort = this.sort();
    if (sort === 'power') list = [...list].sort((a, b) => (b.power ?? 0) - (a.power ?? 0));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  });

  protected readonly poolTypes = computed<readonly TypeRead[]>(() => {
    const seen = new Map<number, TypeRead>();
    for (const move of this.pool()) {
      if (move.type && !seen.has(move.type.id)) {
        seen.set(move.type.id, move.type);
      }
    }
    return [...seen.values()];
  });

  protected typeColor(name: string | undefined): string {
    return getTypeColor(name);
  }

  protected onSearch(raw: string): void {
    this.query.set(raw);
  }

  protected toggleType(id: number): void {
    this.typeId.set(this.typeId() === id ? null : id);
  }

  protected setCategory(category: MoveCategoryFilter): void {
    this.category.set(category);
  }

  protected setSort(sort: MoveSort): void {
    this.sort.set(sort);
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

  private categoryMeta(category: string | undefined): CategoryMeta {
    const key = (category?.toLowerCase() ?? DEFAULT_CATEGORY_KEY) as MoveCategoryKey;
    return CATEGORY_META[key] ?? CATEGORY_META[DEFAULT_CATEGORY_KEY];
  }
}

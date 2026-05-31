import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';

import { CategoryStyle } from '@shared/interfaces/ui/move-detail/category-style.interface';
import { MoveStatTile } from '@shared/interfaces/ui/move-detail/move-stat-tile.interface';
import { MoveCategoryKey } from '@shared/interfaces/ui/move-detail/move-category-key.interface';

import { MoveService } from '@core/services/move.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { map } from 'rxjs';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

const DASH = '—';
const DEFAULT_CATEGORY: MoveCategoryKey = 'status';

const CATEGORY_STYLES: Record<MoveCategoryKey, CategoryStyle> = {
  physical: { color: '#e0503f', glyph: '●' },
  special: { color: '#3f8efc', glyph: '◆' },
  status: { color: '#9aa1ad', glyph: '◇' },
};

/**
 * Read-only detail page for a single move. Type-accented hero, damage-class
 * badge, stat tiles, and effect / in-game flavor text. Renders inside the
 * Pokédex layout (which supplies the navbar + sub-nav), so it owns no chrome.
 */
@Component({
  selector: 'app-move-detail',
  imports: [TypeBadge, RouterLink],
  templateUrl: './move-detail.html',
  styleUrl: './move-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly moveService = inject(MoveService);

  private readonly moveId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
  );

  private readonly moveResource = rxResource({
    params: () => {
      const id = this.moveId();
      return id == null || Number.isNaN(id) ? undefined : { id };
    },
    stream: ({ params }) => this.moveService.getOneMove(params),
  });

  protected readonly move = computed<MoveRead | null>(() => this.moveResource.value() ?? null);
  protected readonly loading = this.moveResource.isLoading;
  protected readonly error = computed(() => !!this.moveResource.error());

  protected readonly accent = computed(() => getTypeColor(this.move()?.type.name));

  protected readonly categoryStyle = computed<CategoryStyle>(() => {
    const rawCategory = this.move()?.category?.toLowerCase() as MoveCategoryKey | undefined;
    return CATEGORY_STYLES[rawCategory ?? DEFAULT_CATEGORY] ?? CATEGORY_STYLES[DEFAULT_CATEGORY];
  });

  protected readonly statTiles = computed<MoveStatTile[]>(() => {
    const move = this.move();
    if (!move) return [];

    return [
      {
        label: 'Power',
        value: move.power ? String(move.power) : DASH,
        faded: !move.power,
        accent: false,
      },
      {
        label: 'Accuracy',
        value: move.accuracy ? `${move.accuracy}%` : DASH,
        faded: !move.accuracy,
        accent: false,
      },
      { label: 'PP', value: String(move.pp), faded: false, accent: false },
      {
        label: 'Priority',
        value: move.priority > 0 ? `+${move.priority}` : String(move.priority),
        faded: move.priority === 0,
        accent: false,
      },
      {
        label: 'Effect rate',
        value: move.effectChance ? `${move.effectChance}%` : DASH,
        faded: !move.effectChance,
        accent: true,
      },
    ];
  });
}

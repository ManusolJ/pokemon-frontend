import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { MoveStatTile } from '@shared/interfaces/ui/move-detail/move-stat-tile.interface';
import { CategoryStyle } from '@shared/interfaces/ui/move-detail/category-style.interface';
import { MoveCategoryKey } from '@shared/interfaces/ui/move-detail/move-category-key.interface';

import { MoveService } from '@core/services/move.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { getTypeColor } from '@shared/utils/get-type-color.util';
import { displayName } from '@shared/utils/display-name.util';

import { SeoService } from '@core/seo/seo.service';

import { map } from 'rxjs';

import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';

const NO_VALUE = '—';
const DEFAULT_CATEGORY: MoveCategoryKey = 'status';

const CATEGORY_STYLES: Record<MoveCategoryKey, CategoryStyle> = {
  status: { color: 'var(--color-muted)', glyph: '◇' },
  special: { color: 'var(--color-info)', glyph: '◆' },
  physical: { color: 'var(--color-fx-negative)', glyph: '●' },
};

@Component({
  imports: [TypeBadge, RouterLink, NameNormalizerPipe, TitleCasePipe],
  selector: 'app-move-detail',
  styleUrl: './move-detail.css',
  templateUrl: './move-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly moveService = inject(MoveService);
  private readonly seo = inject(SeoService);

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

  protected readonly loading = this.moveResource.isLoading;
  protected readonly error = computed(() => !!this.moveResource.error());
  protected readonly move = computed<MoveRead | null>(() => this.moveResource.value() ?? null);

  protected readonly accent = computed(() => getTypeColor(this.move()?.type.name));

  constructor() {
    effect(() => {
      if (this.error()) {
        this.seo.setNoindex(true);
        return;
      }
      const move = this.move();
      if (move) {
        this.seo.setPage(
          `${displayName(move.name)}: power, accuracy and effect`,
          describeMove(move),
        );
      }
    });
  }

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
        value: move.power ? String(move.power) : NO_VALUE,
        faded: !move.power,
        accent: false,
      },
      {
        label: 'Accuracy',
        value: move.accuracy ? `${move.accuracy}%` : NO_VALUE,
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
        value: move.effectChance ? `${move.effectChance}%` : NO_VALUE,
        faded: !move.effectChance,
        accent: true,
      },
    ];
  });
}

function describeMove(move: MoveRead): string {
  const numbers = [
    move.power ? `power ${move.power}` : null,
    move.accuracy ? `accuracy ${move.accuracy}%` : null,
    `${move.pp} PP`,
  ]
    .filter((part) => part !== null)
    .join(', ');
  const effectText = move.shortEffect || move.flavorText || '';

  return `${displayName(move.name)}: ${displayName(move.type.name)}-type ${move.category.toLowerCase()} move. ${numbers.charAt(0).toUpperCase()}${numbers.slice(1)}. ${effectText}`;
}

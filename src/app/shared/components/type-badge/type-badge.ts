import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { TYPE_COLORS } from '@shared/constants/type-colors.constants';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-type-badge',
  styleUrl: './type-badge.css',
  templateUrl: './type-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeBadge {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly color = computed(() => TYPE_COLORS[this.name().toLowerCase() as PokemonType]);
}

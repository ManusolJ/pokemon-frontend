import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { SpeciesSummary } from '@shared/interfaces/pokemon/pokemon/species-summary.interface';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  imports: [TypeBadge],
  selector: 'app-pokemon-card',
  styleUrl: './pokemon-card.css',
  templateUrl: './pokemon-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCard {
  readonly pokemon = input.required<SpeciesSummary>();
  readonly select = output<number>();

  protected readonly types = computed<TypeRead[]>(() => {
    if (this.pokemon()) {
      Array.of(this.pokemon().primaryType, this.pokemon().secondaryType ?? null);
    }
    return [];
  });

  readonly spriteUrl = computed(() => {
    const sprite = this.pokemon().spriteDefault;
    return sprite ? `${environment.spritesBaseUrl}${sprite}` : null;
  });

  protected readonly accent = computed(() => {
    let type;
    if (this.pokemon()) {
      type = this.pokemon().primaryType.name.toLocaleLowerCase();
    }
    return getTypeColor(type);
  });

  protected readonly dex = computed(() =>
    String(this.pokemon().nationalDexNumber).padStart(4, '0'),
  );
}

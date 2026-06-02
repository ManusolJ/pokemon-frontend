import { environment } from '@environments/environment';

import { LEVEL_MAX, LEVEL_MIN } from '@shared/constants/stat.constants';

import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';
import { AbilityEmbed } from '@shared/interfaces/pokemon/ability/ability-embed.interface';
import { SearchableOption } from '@shared/interfaces/ui/generic/searchable-option.interface';

import { TypeBadge } from '@shared/components/type-badge/type-badge';
import { SearchableSelect } from '@shared/components/searchable-select/searchable-select';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { TitleCasePipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';

type MoveCategoryKey = 'physical' | 'special' | 'status';

interface CategoryMeta {
  readonly abbr: string;
  readonly class: string;
}

const DEFAULT_CATEGORY_KEY: MoveCategoryKey = 'status';

const CATEGORY_META: Record<MoveCategoryKey, CategoryMeta> = {
  physical: { abbr: 'PHY', class: 'move-row__cat--phys' },
  special: { abbr: 'SPC', class: 'move-row__cat--spec' },
  status: { abbr: 'STA', class: 'move-row__cat--stat' },
};

const MEGA_NAME_SEGMENT = 'mega';
const NAME_SEGMENT_SEPARATOR = '-';
const HELD_ITEM_PLACEHOLDER_DEFAULT = 'No item';
const HELD_ITEM_PLACEHOLDER_MEGA = 'Mega stone (auto)';

@Component({
  imports: [SearchableSelect, TypeBadge, NameNormalizerPipe, TitleCasePipe],
  selector: 'app-selected-pokemon',
  styleUrl: './selected-pokemon.css',
  templateUrl: './selected-pokemon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedPokemon {
  readonly types = input<readonly TypeRead[]>([]);
  readonly items = input<readonly ItemSummary[]>([]);
  readonly natures = input<readonly NatureRead[]>([]);
  readonly member = input.required<TeamMember | null>();
  readonly abilities = input<readonly AbilityEmbed[]>([]);

  readonly openMovePicker = output<number>();
  readonly memberChange = output<TeamMember>();

  protected readonly levelMin = LEVEL_MIN;
  protected readonly levelMax = LEVEL_MAX;

  protected readonly accent = computed(() => getTypeColor(this.member()?.primaryType.name));

  protected readonly secondaryAccent = computed(() =>
    getTypeColor(this.member()?.secondaryType?.name ?? this.member()?.primaryType.name),
  );

  protected readonly itemOptions = computed<SearchableOption[]>(() =>
    this.items().map((item) => ({ label: item.name, value: item.id, imageUrl: item.spriteUrl })),
  );

  protected readonly abilityOptions = computed<SearchableOption[]>(() =>
    this.abilities().map((embed) => ({ label: embed.ability.name, value: embed.ability.id })),
  );

  protected readonly natureOptions = computed<SearchableOption[]>(() =>
    this.natures().map((nature) => ({
      label: nature.name,
      value: nature.id,
      caption:
        nature.increasedStat === nature.decreasedStat
          ? 'Neutral'
          : `+${nature.increasedStat} · −${nature.decreasedStat}`,
    })),
  );

  protected readonly teraOptions = computed<SearchableOption[]>(() =>
    this.types().map((type) => ({
      label: type.name,
      value: type.id,
      color: getTypeColor(type.name),
    })),
  );

  protected readonly itemValue = computed(() => this.member()?.item?.id ?? null);
  protected readonly abilityValue = computed(() => this.member()?.ability?.id ?? null);
  protected readonly natureValue = computed(() => this.member()?.nature?.id ?? null);
  protected readonly teraValue = computed(() => this.member()?.teraType?.id ?? null);

  protected readonly isMega = computed(() => {
    const name = this.member()?.name;
    if (!name) {
      return false;
    }
    return name.toLowerCase().split(NAME_SEGMENT_SEPARATOR).includes(MEGA_NAME_SEGMENT);
  });

  protected readonly heldItemPlaceholder = computed(() =>
    this.isMega() ? HELD_ITEM_PLACEHOLDER_MEGA : HELD_ITEM_PLACEHOLDER_DEFAULT,
  );

  constructor() {
    effect(() => {
      const member = this.member();
      if (member && this.isMega() && member.item !== null) {
        this.patchMember({ item: null });
      }
    });
  }

  protected onNickname(value: string): void {
    this.patchMember({ nickname: value });
  }

  protected onLevel(raw: string): void {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return;
    }
    this.patchMember({ level: Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, Math.round(parsed))) });
  }

  protected toggleShiny(): void {
    const member = this.member();
    if (!member) {
      return;
    }
    this.patchMember({ shiny: !member.shiny });
  }

  protected onItem(id: string | number | null): void {
    this.patchMember({ item: findById(this.items(), id) });
  }

  protected onAbility(id: string | number | null): void {
    if (id === null || id === undefined) {
      this.patchMember({ ability: null });
      return;
    }
    const match = this.abilities().find((embed) => embed.ability.id === id);
    this.patchMember({ ability: match?.ability ?? null });
  }

  protected onNature(id: string | number | null): void {
    this.patchMember({ nature: findById(this.natures(), id) });
  }

  protected onTera(id: string | number | null): void {
    this.patchMember({ teraType: findById(this.types(), id) });
  }

  protected moveAccent(move: MoveRead | null): string {
    return getTypeColor(move?.type?.name);
  }

  protected categoryClass(move: MoveRead | null): string {
    return this.categoryMeta(move).class;
  }

  protected categoryAbbr(move: MoveRead | null): string {
    return this.categoryMeta(move).abbr;
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }

  private patchMember(patch: Partial<TeamMember>): void {
    const member = this.member();
    if (!member) {
      return;
    }
    this.memberChange.emit({ ...member, ...patch });
  }

  private categoryMeta(move: MoveRead | null): CategoryMeta {
    const key = (move?.category?.toLowerCase() ?? DEFAULT_CATEGORY_KEY) as MoveCategoryKey;
    return CATEGORY_META[key] ?? CATEGORY_META[DEFAULT_CATEGORY_KEY];
  }
}

function findById<T extends { id: number | string }>(
  list: ReadonlyArray<T>,
  id: string | number | null,
): T | null {
  if (id === null || id === undefined) {
    return null;
  }
  return list.find((entry) => entry.id === id) ?? null;
}

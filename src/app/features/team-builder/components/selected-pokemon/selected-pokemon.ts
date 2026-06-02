import { environment } from '@environments/environment';

import { LEVEL_MAX, LEVEL_MIN } from '@shared/constants/stat.constants';

import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';
import { CategoryMeta } from '@shared/interfaces/team-builder/category-meta.interface';
import { SearchableOption } from '@shared/interfaces/ui/generic/searchable-option.interface';
import { MoveCategoryKey } from '@shared/interfaces/ui/move-detail/move-category-key.interface';

import { TypeBadge } from '@shared/components/type-badge/type-badge';
import { SearchableSelect } from '@shared/components/searchable-select/searchable-select';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { TitleCasePipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';

const DEFAULT_CATEGORY_KEY: MoveCategoryKey = 'status';

const CATEGORY_META: Record<MoveCategoryKey, CategoryMeta> = {
  physical: { abbr: 'PHY', class: 'move-row__cat--phys' },
  special: { abbr: 'SPC', class: 'move-row__cat--spec' },
  status: { abbr: 'STA', class: 'move-row__cat--stat' },
};

const MEGA_NAME_SEGMENT = 'mega';
const NAME_SEGMENT_SEPARATOR = '-';
const NUMERIC_STAT_PLACEHOLDER = '—';
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
  readonly member = input.required<TeamMember | null>();

  readonly openItemPicker = output<void>();
  readonly openMovePicker = output<number>();
  readonly openNaturePicker = output<void>();
  readonly openAbilityPicker = output<void>();
  readonly memberChange = output<TeamMember>();

  protected readonly levelMin = LEVEL_MIN;
  protected readonly levelMax = LEVEL_MAX;

  protected readonly accent = computed(() => getTypeColor(this.member()?.primaryType.name));

  protected readonly secondaryAccent = computed(() =>
    getTypeColor(this.member()?.secondaryType?.name ?? this.member()?.primaryType.name),
  );

  protected readonly teraOptions = computed<SearchableOption[]>(() =>
    this.types().map((type) => ({
      label: type.name,
      value: type.id,
      color: getTypeColor(type.name),
    })),
  );

  protected readonly teraValue = computed(() => this.member()?.teraType?.id ?? null);

  protected readonly natureCaption = computed<string | null>(() => {
    const nature = this.member()?.nature;
    if (!nature) {
      return null;
    }
    return nature.increasedStat === nature.decreasedStat
      ? 'Neutral'
      : `+${nature.increasedStat} · −${nature.decreasedStat}`;
  });

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

  protected artworkFor(member: TeamMember): string {
    return member.shiny ? member.artworkShiny : member.artwork;
  }

  protected displayNameFor(member: TeamMember): string {
    return member.nickname || member.name;
  }

  protected movePowerText(move: MoveRead): string {
    return move.power ? String(move.power) : NUMERIC_STAT_PLACEHOLDER;
  }

  protected moveAccuracyText(move: MoveRead): string {
    return move.accuracy ? String(move.accuracy) : NUMERIC_STAT_PLACEHOLDER;
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

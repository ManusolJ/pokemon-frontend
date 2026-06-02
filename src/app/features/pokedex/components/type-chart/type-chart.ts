import { PokemonType } from '@shared/enums/pokemon-types.enum';

import {
  DOUBLE_RESISTED_MULTIPLIER,
  DOUBLE_WEAK_MULTIPLIER,
  IMMUNE_MULTIPLIER,
  NEUTRAL_MULTIPLIER,
  RESISTED_MULTIPLIER,
  SUPER_EFFECTIVE_MULTIPLIER,
} from '@shared/constants/effectiveness.constants';

import { MatrixRow } from '@shared/interfaces/ui/type-chart/matrix-row.interface';
import { MatrixCell } from '@shared/interfaces/ui/type-chart/matrix-cell.interface';
import { ProfileGroup } from '@shared/interfaces/ui/type-chart/profile-group.interface';
import { DefenseProfile } from '@shared/interfaces/ui/type-chart/defense-profile.interface';
import { MultiplierMeta } from '@shared/interfaces/ui/type-chart/multiplier-meta.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';

import { TypeEffectivenessService } from '@core/services/type-effectiveness.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const MULTIPLIER_META: Record<string, Omit<MultiplierMeta, 'value'>> = {
  '0': { label: '0', tone: 'immune' },
  '0.25': { label: '¼', tone: 'quarter' },
  '0.5': { label: '½', tone: 'half' },
  '1': { label: '1', tone: 'neutral' },
  '2': { label: '2', tone: 'super' },
  '4': { label: '4', tone: 'superhi' },
};

const DEFAULT_MULTIPLIER_META = MULTIPLIER_META[String(NEUTRAL_MULTIPLIER)];

const MAX_DEFENDERS = 2;
const TYPE_COUNT = Object.keys(PokemonType).length;

const TYPE_BORDER_ALPHA_SUFFIX = '80';
const TYPE_BACKGROUND_MIX_PERCENT = 12;
const EMPTY_SLOT_BORDER = 'var(--color-brand-line)';
const EMPTY_SLOT_BACKGROUND = 'transparent';
const EMPTY_SLOT_COLOR = 'var(--color-brand-dim)';

@Component({
  imports: [TypeBadge],
  selector: 'app-type-chart',
  styleUrl: './type-chart.css',
  templateUrl: './type-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeChart implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly typeEffectivenessService = inject(TypeEffectivenessService);

  protected readonly loading = signal(true);
  protected readonly types = signal<PokemonType[]>([]);
  protected readonly defenders = signal<PokemonType[]>([]);

  private readonly effectivenessChart = signal<EffectivenessChart>(new Map());

  protected readonly hasSelection = computed(() => this.defenders().length > 0);

  protected readonly defenderSlots = computed<(PokemonType | null)[]>(() => {
    const selectedDefenders = this.defenders();
    return [selectedDefenders[0] ?? null, selectedDefenders[1] ?? null];
  });

  protected readonly matrix = computed<MatrixRow[]>(() => this.buildMatrix());

  protected readonly combinedEffectiveness = computed<ReadonlyMap<
    PokemonType,
    MultiplierMeta
  > | null>(() => this.buildCombinedEffectiveness());

  protected readonly profile = computed<DefenseProfile | null>(() => this.buildProfile());

  protected readonly skeletonRows = Array.from({ length: TYPE_COUNT });

  ngOnInit(): void {
    this.fetchEffectivenessMatrix();
  }

  protected getTypeColor(type: string): string {
    return getTypeColor(type);
  }

  protected abbreviateType(type: PokemonType): string {
    return type.slice(0, 3).toUpperCase();
  }

  protected isDefender(type: PokemonType): boolean {
    return this.defenders().includes(type);
  }

  protected getCellClasses(cell: MatrixCell): string {
    const classes = ['fx', `fx--${cell.tone}`];
    if (this.isDefender(cell.defender)) {
      classes.push('is-defender');
    } else if (this.hasSelection()) {
      classes.push('dimmed');
    }
    return classes.join(' ');
  }

  protected getHeaderClasses(defender: PokemonType): string {
    return this.isDefender(defender) ? 'col-head is-defender' : 'col-head';
  }

  protected slotBorderColor(slot: PokemonType | null): string {
    if (!slot) {
      return EMPTY_SLOT_BORDER;
    }
    return `${getTypeColor(slot)}${TYPE_BORDER_ALPHA_SUFFIX}`;
  }

  protected slotBackground(slot: PokemonType | null): string {
    if (!slot) {
      return EMPTY_SLOT_BACKGROUND;
    }
    return `color-mix(in srgb, ${getTypeColor(slot)} ${TYPE_BACKGROUND_MIX_PERCENT}%, transparent)`;
  }

  protected slotColor(slot: PokemonType | null): string {
    if (!slot) {
      return EMPTY_SLOT_COLOR;
    }
    return getTypeColor(slot);
  }

  protected defenderHeaderColor(type: PokemonType): string | null {
    if (!this.isDefender(type)) {
      return null;
    }
    return getTypeColor(type);
  }

  protected getCombinedMultiplier(attacker: PokemonType): MultiplierMeta | null {
    return this.combinedEffectiveness()?.get(attacker) ?? null;
  }

  protected toggleDefender(type: PokemonType): void {
    this.defenders.update((current) => {
      if (current.includes(type)) {
        return current.filter((existing) => existing !== type);
      }
      if (current.length < MAX_DEFENDERS) {
        return [...current, type];
      }
      return [current[1], type];
    });
  }

  protected clear(): void {
    this.defenders.set([]);
  }

  private fetchEffectivenessMatrix(): void {
    this.typeEffectivenessService
      .loadChart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ chart, types }) => {
          this.effectivenessChart.set(chart);
          this.types.set(types.map((type) => type.name.toLowerCase() as PokemonType));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private buildMatrix(): MatrixRow[] {
    const allTypes = this.types();
    return allTypes.map((attacker) => ({
      attacker,
      cells: allTypes.map((defender) => ({
        defender,
        ...resolveMultiplierMeta(this.getEffectiveness(attacker, defender)),
      })),
    }));
  }

  private buildCombinedEffectiveness(): ReadonlyMap<PokemonType, MultiplierMeta> | null {
    const selectedDefenders = this.defenders();
    if (!selectedDefenders.length) {
      return null;
    }
    return new Map(
      this.types().map((attacker) => [
        attacker,
        resolveMultiplierMeta(this.calculateCombinedMultiplier(attacker, selectedDefenders)),
      ]),
    );
  }

  private buildProfile(): DefenseProfile | null {
    const selectedDefenders = this.defenders();
    if (!selectedDefenders.length || !this.types().length) {
      return null;
    }

    const typesByMultiplier = this.groupTypesByMultiplier(selectedDefenders);
    const typesWithMultiplier = (multiplier: number): PokemonType[] =>
      typesByMultiplier.get(multiplier) ?? [];

    const doubleWeak = typesWithMultiplier(DOUBLE_WEAK_MULTIPLIER);
    const superEffective = typesWithMultiplier(SUPER_EFFECTIVE_MULTIPLIER);
    const resisted = typesWithMultiplier(RESISTED_MULTIPLIER);
    const doubleResisted = typesWithMultiplier(DOUBLE_RESISTED_MULTIPLIER);
    const immune = typesWithMultiplier(IMMUNE_MULTIPLIER);
    const neutral = typesWithMultiplier(NEUTRAL_MULTIPLIER);

    const groups: ProfileGroup[] = [
      { label: 'Double weak', detail: '4× damage', tone: 'super', types: doubleWeak },
      { label: 'Weak to', detail: '2× damage', tone: 'super', types: superEffective },
      { label: 'Resists', detail: '½× damage', tone: 'resist', types: resisted },
      { label: 'Doubly resists', detail: '¼× damage', tone: 'resist', types: doubleResisted },
      { label: 'Immune to', detail: '0× damage', tone: 'immune', types: immune },
    ];

    return {
      weaknesses: doubleWeak.length + superEffective.length,
      resistances: resisted.length + doubleResisted.length,
      immunities: immune.length,
      groups,
      neutral,
    };
  }

  private getEffectiveness(attacker: PokemonType, defender: PokemonType): number {
    return this.effectivenessChart().get(attacker)?.get(defender) ?? NEUTRAL_MULTIPLIER;
  }

  private calculateCombinedMultiplier(
    attacker: PokemonType,
    selectedDefenders: readonly PokemonType[],
  ): number {
    return selectedDefenders.reduce(
      (multiplier, defender) => multiplier * this.getEffectiveness(attacker, defender),
      NEUTRAL_MULTIPLIER,
    );
  }

  private groupTypesByMultiplier(
    selectedDefenders: readonly PokemonType[],
  ): Map<number, PokemonType[]> {
    const buckets = new Map<number, PokemonType[]>();
    for (const attacker of this.types()) {
      const multiplier = this.calculateCombinedMultiplier(attacker, selectedDefenders);
      const existing = buckets.get(multiplier);
      if (existing) {
        existing.push(attacker);
      } else {
        buckets.set(multiplier, [attacker]);
      }
    }
    return buckets;
  }
}

function resolveMultiplierMeta(value: number): MultiplierMeta {
  return { value, ...(MULTIPLIER_META[String(value)] ?? DEFAULT_MULTIPLIER_META) };
}

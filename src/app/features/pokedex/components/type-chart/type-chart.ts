import { PokemonType } from '@shared/enums/pokemon-types.enum';

import { MatrixRow } from '@shared/interfaces/ui/matrix-row.interface';
import { MatrixCell } from '@shared/interfaces/ui/matrix-cell.interface';
import { ProfileGroup } from '@shared/interfaces/ui/profile-group.interface';
import { DefenseProfile } from '@shared/interfaces/ui/defense-profile.interface';
import { MultiplierMeta } from '@shared/interfaces/ui/multiplier-meta.interface';
import { TypeEffectivenessRead } from '@shared/interfaces/pokemon/type/type-effectiveness-read.interface';

import { TypeService } from '@core/services/type.service';

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

type EffectivenessChart = ReadonlyMap<PokemonType, ReadonlyMap<PokemonType, number>>;

const MULTIPLIER_META: Record<string, Omit<MultiplierMeta, 'value'>> = {
  '0': { label: '0', tone: 'immune' },
  '0.25': { label: '¼', tone: 'quarter' },
  '0.5': { label: '½', tone: 'half' },
  '1': { label: '1', tone: 'neutral' },
  '2': { label: '2', tone: 'super' },
  '4': { label: '4', tone: 'superhi' },
};

const DEFAULT_MULTIPLIER_META = MULTIPLIER_META['1'];

const MAX_DEFENDERS = 2;
const TYPE_COUNT = Object.keys(PokemonType).length;

const IMMUNE_MULTIPLIER = 0;
const NEUTRAL_MULTIPLIER = 1;
const RESISTED_MULTIPLIER = 0.5;
const DOUBLE_WEAK_MULTIPLIER = 4;
const SUPER_EFFECTIVE_MULTIPLIER = 2;
const DOUBLE_RESISTED_MULTIPLIER = 0.25;

const MATRIX_PAGE_SIZE = 500;

@Component({
  imports: [TypeBadge],
  selector: 'app-type-chart',
  styleUrl: './type-chart.css',
  templateUrl: './type-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeChart implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly typeService = inject(TypeService);

  protected readonly loading = signal(true);
  protected readonly types = signal<PokemonType[]>([]);
  protected readonly defenders = signal<PokemonType[]>([]);

  private readonly effectivenessChart = signal<EffectivenessChart>(new Map());

  protected readonly hasSelection = computed(() => this.defenders().length > 0);

  protected readonly defenderSlots = computed<(PokemonType | null)[]>(() => {
    const selectedDefenders = this.defenders();
    return [selectedDefenders[0] ?? null, selectedDefenders[1] ?? null];
  });

  protected readonly matrix = computed<MatrixRow[]>(() => {
    const allTypes = this.types();
    return allTypes.map((attacker) => ({
      attacker,
      cells: allTypes.map((defender) => ({
        defender,
        ...resolveMultiplierMeta(this.getEffectiveness(attacker, defender)),
      })),
    }));
  });

  protected readonly combinedEffectiveness = computed<ReadonlyMap<
    PokemonType,
    MultiplierMeta
  > | null>(() => {
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
  });

  protected readonly profile = computed<DefenseProfile | null>(() => {
    const selectedDefenders = this.defenders();
    if (!selectedDefenders.length || !this.types().length) {
      return null;
    }

    const typesByMultiplier = this.groupTypesByMultiplier(selectedDefenders);
    const typesWithMultiplier = (multiplier: number) => typesByMultiplier.get(multiplier) ?? [];

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
  });

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

  protected getCombinedMultiplier(attacker: PokemonType): MultiplierMeta | null {
    return this.combinedEffectiveness()?.get(attacker) ?? null;
  }

  protected toggleDefender(type: PokemonType): void {
    this.defenders.update((current) => {
      if (current.includes(type)) {
        return current.filter((t) => t !== type);
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
      const bucket = buckets.get(multiplier);

      if (bucket) {
        bucket.push(attacker);
      } else {
        buckets.set(multiplier, [attacker]);
      }
    }

    return buckets;
  }

  private fetchEffectivenessMatrix(): void {
    this.typeService
      .getTypeEffectivenessPageWithFilter({}, { page: 0, size: MATRIX_PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.buildChartFromRows(response.content),
        error: () => this.loading.set(false),
      });
  }

  private buildChartFromRows(rows: readonly TypeEffectivenessRead[]): void {
    const typeOrder: PokemonType[] = [];
    const seenTypes = new Set<PokemonType>();
    const chart = new Map<PokemonType, Map<PokemonType, number>>();

    for (const row of rows) {
      const attacker = row.attackingType.name.toLowerCase() as PokemonType;
      const defender = row.defendingType.name.toLowerCase() as PokemonType;

      if (!seenTypes.has(attacker)) {
        seenTypes.add(attacker);
        typeOrder.push(attacker);
      }

      let attackerRow = chart.get(attacker);
      if (!attackerRow) {
        attackerRow = new Map<PokemonType, number>();
        chart.set(attacker, attackerRow);
      }
      attackerRow.set(defender, row.multiplier);
    }

    this.types.set(typeOrder);
    this.effectivenessChart.set(chart);
    this.loading.set(false);
  }
}

function resolveMultiplierMeta(value: number): MultiplierMeta {
  return { value, ...(MULTIPLIER_META[String(value)] ?? DEFAULT_MULTIPLIER_META) };
}

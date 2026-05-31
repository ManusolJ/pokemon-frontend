import { environment } from '@environments/environment';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { MoveEmbed } from '@shared/interfaces/pokemon/move/move-embed.interface';
import { StatRow } from '@shared/interfaces/ui/pokemon-detail/stat-row.interface';
import { GenderRate } from '@shared/interfaces/ui/pokemon-detail/gender-rate.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { SpeciesRead } from '@shared/interfaces/pokemon/pokemon/species-read.interface';
import { AbilityRead } from '@shared/interfaces/pokemon/ability/ability-read.interface';
import { VisibleMove } from '@shared/interfaces/ui/pokemon-detail/visible-move.interface';

import { MoveService } from '@core/services/move.service';
import { PokemonService } from '@core/services/pokemon.service';
import { SpeciesService } from '@core/services/species.service';
import { AbilityService } from '@core/services/ability.service';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import {
  effect,
  inject,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import { forkJoin, map, of } from 'rxjs';

import { DecimalPipe, TitleCasePipe } from '@angular/common';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { rxResource, toSignal } from '@angular/core/rxjs-interop';

type MoveGroupKey = 'level' | 'tutor' | 'machine';

const STAT_MAX = 200;
const GENDER_RATE_DIVISOR = 8;
const HATCH_STEPS_PER_CYCLE = 256;
const DEX_NUMBER_DISPLAY_WIDTH = 4;
const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const LEARN_METHOD_TUTOR = 'tutor';
const LEARN_METHOD_LEVEL = 'level-up';
const LEARN_METHOD_MACHINE = 'machine';

const MOVE_GROUPS: ReadonlyArray<{ readonly key: MoveGroupKey; readonly label: string }> = [
  { key: 'level', label: 'Level' },
  { key: 'machine', label: 'TM' },
  { key: 'tutor', label: 'Tutor' },
];

const ALL_MOVE_METHODS: ReadonlyArray<MoveGroupKey> = MOVE_GROUPS.map((group) => group.key);

const STAT_COLOR_TIERS: ReadonlyArray<{ readonly threshold: number; readonly color: string }> = [
  { threshold: 100, color: '#54C66F' },
  { threshold: 80, color: '#9FD05A' },
  { threshold: 60, color: '#F4C534' },
  { threshold: 40, color: '#F2944B' },
];
const STAT_COLOR_LOWEST = '#E0503F';

@Component({
  imports: [TypeBadge, DecimalPipe, TitleCasePipe, NameNormalizerPipe, RouterLink],
  selector: 'app-pokemon-detail',
  styleUrl: './pokemon-detail.css',
  templateUrl: './pokemon-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly moveService = inject(MoveService);
  private readonly pokemonService = inject(PokemonService);
  private readonly speciesService = inject(SpeciesService);
  private readonly abilityService = inject(AbilityService);

  private readonly pokemonId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
  );

  private readonly pokemonResource = rxResource({
    params: () => {
      const id = this.pokemonId();
      return id == null || Number.isNaN(id) ? undefined : { id };
    },
    stream: ({ params }) => this.pokemonService.getOnePokemon(params),
  });

  private readonly speciesResource = rxResource({
    params: () => {
      const id = this.pokemonId();
      return id == null || Number.isNaN(id) ? undefined : { id };
    },
    stream: ({ params }) => this.speciesService.getOneSpecies(params),
  });

  private readonly abilitiesResource = rxResource({
    params: () => this.pokemonResource.value()?.abilities,
    stream: ({ params }) => {
      if (params.length === 0) {
        return of<AbilityRead[]>([]);
      }
      return forkJoin(
        params.map((embed) => this.abilityService.getOneAbility({ id: embed.ability.id })),
      );
    },
    defaultValue: [],
  });

  private readonly movesResource = rxResource({
    params: () => this.pokemonResource.value()?.id,
    stream: ({ params }) =>
      this.moveService.getMovesForPokemon(params).pipe(map((page) => page.content)),
    defaultValue: [],
  });

  protected readonly pokemon = computed<PokemonRead | null>(
    () => this.pokemonResource.value() ?? null,
  );

  protected readonly species = computed<SpeciesRead | null>(
    () => this.speciesResource.value() ?? null,
  );

  protected readonly pokemonMoves = computed(() => this.movesResource.value());

  protected readonly moveGroups = computed<
    ReadonlyArray<{
      readonly key: MoveGroupKey;
      readonly label: string;
      readonly entries: MoveEmbed[];
    }>
  >(() => {
    const moves = this.pokemonMoves();
    return MOVE_GROUPS.map(({ key, label }) => ({
      key,
      label,
      entries: this.entriesForGroup(moves, key),
    }));
  });

  protected readonly abilityDetails = computed(
    () => new Map(this.abilitiesResource.value().map((ability) => [ability.id, ability])),
  );

  protected readonly loading = computed(
    () => this.pokemonResource.isLoading() || this.speciesResource.isLoading(),
  );

  protected readonly error = computed(
    () => this.pokemonResource.error() !== null || this.speciesResource.error() !== null,
  );

  protected readonly shiny = signal(false);
  protected readonly activeMethods = signal<ReadonlySet<MoveGroupKey>>(new Set(ALL_MOVE_METHODS));

  protected readonly visibleMoves = computed<VisibleMove[]>(() => {
    const moves = this.pokemonMoves();
    const active = this.activeMethods();
    const result: VisibleMove[] = [];

    for (const { key } of MOVE_GROUPS) {
      if (!active.has(key)) {
        continue;
      }
      for (const entry of this.entriesForGroup(moves, key)) {
        result.push({ entry, methodKey: key, learnLabel: this.learnLabel(key, entry) });
      }
    }

    return result;
  });

  protected readonly nextPokemonRoute = computed(() => {
    const id = this.pokemonId();
    return id == null || Number.isNaN(id) ? null : ['/pokedex/pokemon', id + 1];
  });

  protected readonly accent = computed(() => getTypeColor(this.pokemon()?.primaryType.name));

  protected readonly types = computed<TypeRead[]>(() => {
    const pokemon = this.pokemon();
    const types: TypeRead[] = [];
    if (pokemon) {
      types.push(pokemon.primaryType);
      if (pokemon.secondaryType) {
        types.push(pokemon.secondaryType);
      }
    }
    return types;
  });

  protected readonly artwork = computed(() => {
    const pokemon = this.pokemon();
    if (pokemon) {
      return this.shiny() ? pokemon.artworkShiny : pokemon.artworkUrl;
    }
    return null;
  });

  protected readonly dexNumber = computed(() => {
    const species = this.species();
    return species
      ? species.nationalDexNumber.toString().padStart(DEX_NUMBER_DISPLAY_WIDTH, '0')
      : null;
  });

  protected readonly statRows = computed<StatRow[]>(() => {
    const pokemon = this.pokemon();
    if (pokemon) {
      return [
        { label: 'HP', value: pokemon.baseHp },
        { label: 'Attack', value: pokemon.baseAtk },
        { label: 'Defense', value: pokemon.baseDef },
        { label: 'Sp. Atk', value: pokemon.baseSpAtk },
        { label: 'Sp. Def', value: pokemon.baseSpDef },
        { label: 'Speed', value: pokemon.baseSpeed },
      ];
    }

    return [];
  });

  protected readonly statTotal = computed(() =>
    this.statRows().reduce((sum, row) => sum + row.value, 0),
  );

  protected readonly generationLabel = computed(() => {
    const species = this.species();
    return species ? ROMAN_NUMERALS[species.generation] : null;
  });

  protected readonly gender = computed<GenderRate>(() => {
    const species = this.species();
    const genderless: GenderRate = { male: 0, female: 0, genderless: true };

    if (!species || species.genderRate < 0) {
      return genderless;
    }

    const femalePercent = (species.genderRate / GENDER_RATE_DIVISOR) * 100;

    return {
      genderless: false,
      female: femalePercent,
      male: 100 - femalePercent,
    };
  });

  protected readonly hatchSteps = computed(() => {
    const species = this.species();
    return species ? (species.hatchCounter + 1) * HATCH_STEPS_PER_CYCLE : 0;
  });

  constructor() {
    effect(() => {
      this.pokemonId();
      this.shiny.set(false);
      this.activeMethods.set(new Set(ALL_MOVE_METHODS));
    });
  }

  protected toggleMoveMethod(key: MoveGroupKey): void {
    const next = new Set(this.activeMethods());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.activeMethods.set(next);
  }

  protected isMethodActive(key: MoveGroupKey): boolean {
    return this.activeMethods().has(key);
  }

  private learnLabel(key: MoveGroupKey, entry: MoveEmbed): string {
    if (key === 'level') {
      return entry.levelLearnedAt ? `Lv ${entry.levelLearnedAt}` : 'Level';
    }
    return key === 'machine' ? 'TM' : 'Tutor';
  }

  protected setShiny(value: boolean): void {
    this.shiny.set(value);
  }

  private entriesForGroup(moves: MoveEmbed[], group: MoveGroupKey): MoveEmbed[] {
    switch (group) {
      case 'level':
        return moves
          .filter((entry) => entry.learnMethod === LEARN_METHOD_LEVEL)
          .sort((a, b) => (a.levelLearnedAt ?? 0) - (b.levelLearnedAt ?? 0));
      case 'tutor':
        return moves.filter((entry) => entry.learnMethod === LEARN_METHOD_TUTOR);
      case 'machine':
        return moves.filter((entry) => entry.learnMethod === LEARN_METHOD_MACHINE);
    }
  }

  protected statBarPercent(value: number): number {
    return Math.min(100, (value / STAT_MAX) * 100);
  }

  protected statColor(value: number): string {
    return STAT_COLOR_TIERS.find((tier) => value >= tier.threshold)?.color ?? STAT_COLOR_LOWEST;
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }
}

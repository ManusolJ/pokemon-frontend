import { LEVEL_MAX } from '@shared/constants/stat.constants';

import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamCreate } from '@shared/interfaces/pokemon/team/team-create.interface';
import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { TeamPokemonCreate } from '@shared/interfaces/pokemon/team/team-pokemon-create.interface';

import { AuthService } from '@core/services/auth.service';
import { ItemService } from '@core/services/item.service';
import { TeamService } from '@core/services/team.service';
import { TypeService } from '@core/services/type.service';
import { NatureService } from '@core/services/nature.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { TeamGrid } from '@features/team-builder/components/team-grid/team-grid';
import { StatSpread } from '@features/team-builder/components/stat-spread/stat-spread';
import { SelectedPokemon } from '@features/team-builder/components/selected-pokemon/selected-pokemon';

import { MovePicker } from '@features/team-builder/modals/move-picker/move-picker';
import { PokemonPicker } from '@features/team-builder/modals/pokemon-picker/pokemon-picker';

import { emptyEvs, maxIvs } from '@shared/utils/stats.util';

import { map, of, switchMap } from 'rxjs';

import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';

const EMPTY_MOVE_SLOTS: ReadonlyArray<MoveRead | null> = [null, null, null, null];

@Component({
  imports: [TeamGrid, SelectedPokemon, StatSpread, PokemonPicker, MovePicker, RouterLink],
  selector: 'app-builder-tab',
  styleUrl: './builder-tab.css',
  templateUrl: './builder-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderTab {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly itemService = inject(ItemService);
  private readonly typeService = inject(TypeService);
  private readonly natureService = inject(NatureService);
  protected readonly state = inject(TeamBuilderStateService);

  protected readonly movePickerSlot = signal<number | null>(null);
  protected readonly pokemonPickerSlot = signal<number | null>(null);

  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  private readonly itemsResource = rxResource({
    stream: () =>
      this.itemService
        .getItemCountWithFilter({})
        .pipe(
          switchMap((count) =>
            count === 0
              ? of<readonly ItemSummary[]>([])
              : this.itemService
                  .getItemSummaryPageWithFilter(
                    {},
                    { page: 0, size: count, sort: 'name', direction: 'ASC' },
                  )
                  .pipe(map((page) => page.content)),
          ),
        ),
    defaultValue: [],
  });

  private readonly naturesResource = rxResource({
    stream: () =>
      this.natureService
        .getNatureCountWithFilter({})
        .pipe(
          switchMap((count) =>
            count === 0
              ? of<readonly NatureRead[]>([])
              : this.natureService
                  .getNaturePageWithFilter(
                    {},
                    { page: 0, size: count, sort: 'name', direction: 'ASC' },
                  )
                  .pipe(map((page) => page.content)),
          ),
        ),
    defaultValue: [],
  });

  private readonly typesResource = rxResource({
    stream: () => {
      return this.typeService.getTypeCountWithFilter({}).pipe(
        switchMap((count) =>
          count === 0
            ? of<readonly TypeRead[]>([])
            : this.typeService
                .getTypePageWithFilter(
                  {},
                  {
                    page: 0,
                    size: count,
                    sort: 'name',
                    direction: 'ASC',
                  },
                )
                .pipe(map((page) => page.content)),
        ),
      );
    },
    defaultValue: [],
  });

  protected readonly items = computed(() => this.itemsResource.value());
  protected readonly types = computed(() => this.typesResource.value());
  protected readonly natures = computed(() => this.naturesResource.value());

  protected readonly optionsError = computed(
    () =>
      !!this.itemsResource.error() ||
      !!this.typesResource.error() ||
      !!this.naturesResource.error(),
  );

  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly abilities = computed(
    () => this.state.activeMember()?.availableAbilities ?? [],
  );

  protected readonly currentMove = computed<MoveRead | null>(() => {
    const slot = this.movePickerSlot();
    const member = this.state.activeMember();
    if (slot === null || !member) {
      return null;
    }
    return member.moves[slot] ?? null;
  });

  protected readonly disabledMoveIds = computed<readonly number[]>(() => {
    const slot = this.movePickerSlot();
    const member = this.state.activeMember();
    if (slot === null || !member) {
      return [];
    }
    return member.moves
      .map((move, index) => (index === slot ? null : (move?.id ?? null)))
      .filter((id): id is number => id !== null);
  });

  protected readonly canSave = computed(() => {
    if (this.saving()) {
      return false;
    }

    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.state.teamName().trim().length === 0) {
      return false;
    }

    const filled = this.state.members().filter((m): m is TeamMember => m !== null);

    if (filled.length === 0) {
      return false;
    }
    return filled.every((m) => m.ability !== null);
  });

  protected onSlotAdd(teamSlot: number): void {
    this.pokemonPickerSlot.set(teamSlot);
  }

  protected onPokemonPicked(pokemon: PokemonRead): void {
    const slot = this.pokemonPickerSlot();
    if (slot === null) {
      return;
    }

    const member: TeamMember = {
      pokemonId: pokemon.id,
      name: pokemon.name,
      spriteDefault: pokemon.spriteDefault,
      spriteShiny: pokemon.spriteShiny,
      artwork: pokemon.artworkUrl,
      artworkShiny: pokemon.artworkShiny ?? '',
      primaryType: pokemon.primaryType,
      secondaryType: pokemon.secondaryType,
      species: pokemon.species,
      availableAbilities: pokemon.abilities,
      nickname: '',
      level: LEVEL_MAX,
      shiny: false,
      ability: null,
      nature: null,
      item: null,
      teraType: null,
      evs: emptyEvs(),
      ivs: maxIvs(),
      moves: EMPTY_MOVE_SLOTS,
    };

    this.state.addMember(slot, member);
    this.pokemonPickerSlot.set(null);
  }

  protected onPokemonPickerClosed(): void {
    this.pokemonPickerSlot.set(null);
  }

  protected onOpenMovePicker(slot: number): void {
    this.movePickerSlot.set(slot);
  }

  protected onMovePicked(move: MoveRead | null): void {
    const slot = this.movePickerSlot();
    const member = this.state.activeMember();
    if (slot === null || !member) {
      return;
    }
    const moves = [...member.moves];
    moves[slot] = move;
    this.state.updateActiveMember({ ...member, moves });
    this.movePickerSlot.set(null);
  }

  protected onMovePickerClosed(): void {
    this.movePickerSlot.set(null);
  }

  protected resetAll(): void {
    this.state.reset();
    this.saveError.set(null);
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const payload: TeamCreate = {
      name: this.state.teamName().trim(),
      isPublic: !this.state.isPrivate(),
      pokemon: this.state
        .members()
        .filter((m): m is TeamMember => m !== null)
        .map((m) => this.toBackendPokemon(m)),
    };

    this.teamService
      .createTeam(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetAll();
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Could not save the team. Please try again.');
        },
      });
  }

  private toBackendPokemon(member: TeamMember): TeamPokemonCreate {
    if (!member.ability) {
      throw new Error(`Cannot save team member ${member.name}: ability is required.`);
    }

    return {
      pokemonId: member.pokemonId,
      abilityId: member.ability.id,
      natureId: member.nature?.id,
      itemId: member.item?.id,
      teraTypeId: member.teraType?.id,
      nickname: member.nickname || undefined,
      level: member.level,
      shiny: member.shiny,
      evHp: member.evs.hp,
      evAtk: member.evs.attack,
      evDef: member.evs.defense,
      evSpAtk: member.evs.specialAttack,
      evSpDef: member.evs.specialDefense,
      evSpeed: member.evs.speed,
      ivHp: member.ivs.hp,
      ivAtk: member.ivs.attack,
      ivDef: member.ivs.defense,
      ivSpAtk: member.ivs.specialAttack,
      ivSpDef: member.ivs.specialDefense,
      ivSpeed: member.ivs.speed,
      moveIds: member.moves
        .filter((move): move is MoveRead => move !== null)
        .map((move) => move.id),
    };
  }
}

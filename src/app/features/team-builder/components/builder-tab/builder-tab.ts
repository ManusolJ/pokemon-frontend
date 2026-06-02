import { LEVEL_MAX } from '@shared/constants/stat.constants';

import { ItemRead } from '@shared/interfaces/pokemon/item/item-read.interface';
import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamCreate } from '@shared/interfaces/pokemon/team/team-create.interface';
import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { AbilityRead } from '@shared/interfaces/pokemon/ability/ability-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { AbilitySummary } from '@shared/interfaces/pokemon/ability/ability-summary.interface';
import { TeamPokemonCreate } from '@shared/interfaces/pokemon/team/team-pokemon-create.interface';

import { AuthService } from '@core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { TypeService } from '@core/services/type.service';
import { TeamBuilderStateService } from '@core/services/team-builder-state.service';

import { TeamGrid } from '@features/team-builder/components/team-grid/team-grid';
import { StatSpread } from '@features/team-builder/components/stat-spread/stat-spread';
import { SelectedPokemon } from '@features/team-builder/components/selected-pokemon/selected-pokemon';

import { MovePicker } from '@features/team-builder/modals/move-picker/move-picker';
import { ItemPicker } from '@features/team-builder/modals/item-picker/item-picker';
import { NaturePicker } from '@features/team-builder/modals/nature-picker/nature-picker';
import { AbilityPicker } from '@features/team-builder/modals/ability-picker/ability-picker';
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
  imports: [
    TeamGrid,
    SelectedPokemon,
    StatSpread,
    PokemonPicker,
    MovePicker,
    ItemPicker,
    NaturePicker,
    AbilityPicker,
    RouterLink,
  ],
  selector: 'app-builder-tab',
  styleUrl: './builder-tab.css',
  templateUrl: './builder-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderTab {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly typeService = inject(TypeService);
  protected readonly state = inject(TeamBuilderStateService);

  protected readonly movePickerSlot = signal<number | null>(null);
  protected readonly pokemonPickerSlot = signal<number | null>(null);
  protected readonly itemPickerOpen = signal(false);
  protected readonly naturePickerOpen = signal(false);
  protected readonly abilityPickerOpen = signal(false);

  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

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

  protected readonly types = computed(() => this.typesResource.value());

  protected readonly optionsError = computed(() => !!this.typesResource.error());

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

  protected readonly currentItemId = computed(() => this.state.activeMember()?.item?.id ?? null);
  protected readonly currentNatureId = computed(
    () => this.state.activeMember()?.nature?.id ?? null,
  );
  protected readonly currentAbilityId = computed(
    () => this.state.activeMember()?.ability?.id ?? null,
  );

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
      baseStats: {
        hp: pokemon.baseHp,
        attack: pokemon.baseAtk,
        defense: pokemon.baseDef,
        specialAttack: pokemon.baseSpAtk,
        specialDefense: pokemon.baseSpDef,
        speed: pokemon.baseSpeed,
      },
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

  protected onOpenItemPicker(): void {
    if (this.state.activeMember()) {
      this.itemPickerOpen.set(true);
    }
  }

  protected onItemPicked(item: ItemRead | null): void {
    const member = this.state.activeMember();
    if (!member) {
      return;
    }
    const next: ItemSummary | null = item
      ? { id: item.id, name: item.name, spriteUrl: item.spriteUrl }
      : null;
    this.state.updateActiveMember({ ...member, item: next });
    this.itemPickerOpen.set(false);
  }

  protected onItemPickerClosed(): void {
    this.itemPickerOpen.set(false);
  }

  protected onOpenNaturePicker(): void {
    if (this.state.activeMember()) {
      this.naturePickerOpen.set(true);
    }
  }

  protected onNaturePicked(nature: NatureRead | null): void {
    const member = this.state.activeMember();
    if (!member) {
      return;
    }
    this.state.updateActiveMember({ ...member, nature });
    this.naturePickerOpen.set(false);
  }

  protected onNaturePickerClosed(): void {
    this.naturePickerOpen.set(false);
  }

  protected onOpenAbilityPicker(): void {
    if (this.state.activeMember()) {
      this.abilityPickerOpen.set(true);
    }
  }

  protected onAbilityPicked(ability: AbilityRead | null): void {
    const member = this.state.activeMember();
    if (!member) {
      return;
    }
    const next: AbilitySummary | null = ability ? { id: ability.id, name: ability.name } : null;
    this.state.updateActiveMember({ ...member, ability: next });
    this.abilityPickerOpen.set(false);
  }

  protected onAbilityPickerClosed(): void {
    this.abilityPickerOpen.set(false);
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

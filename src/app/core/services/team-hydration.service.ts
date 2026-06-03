import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { TeamRead } from '@shared/interfaces/pokemon/team/team-read.interface';
import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { TeamDraft } from '@shared/interfaces/team-builder/member/team-draft.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';
import { TeamPokemonRead } from '@shared/interfaces/pokemon/team/team-pokemon-read.interface';
import { TeamPokemonMoveEmbed } from '@shared/interfaces/pokemon/team/team-pokemon-move.interface';

import { MoveService } from './move.service';
import { TeamService } from './team.service';
import { PokemonService } from './pokemon.service';

import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { TEAM_SLOT_COUNT } from '@shared/utils/team.util';

const TEAM_MOVE_SLOT_COUNT = 4;
const FALLBACK_ARTWORK_SHINY = '';

@Injectable({ providedIn: 'root' })
export class TeamHydrationService {
  private readonly moveService = inject(MoveService);
  private readonly teamService = inject(TeamService);
  private readonly pokemonService = inject(PokemonService);

  hydrate(team: TeamRead, { asDraft = false } = {}): Observable<TeamDraft> {
    return forkJoin(team.pokemon.map((member) => this.hydrateMember(member))).pipe(
      map((members) => this.toDraft(team, members, asDraft)),
    );
  }

  loadSelfTeamAsDraft(id: number): Observable<TeamDraft> {
    return this.teamService
      .getOneSelfTeam({ id })
      .pipe(switchMap((team) => this.hydrate(team, { asDraft: false })));
  }

  loadPublicTeamAsDraft(id: number): Observable<TeamDraft> {
    return this.teamService
      .getOnePublicTeam({ id })
      .pipe(switchMap((team) => this.hydrate(team, { asDraft: true })));
  }

  private hydrateMember(member: TeamPokemonRead): Observable<TeamMember> {
    return forkJoin({
      pokemon: this.pokemonService.getOnePokemon({ id: member.pokemon.id }),
      moves: this.hydrateMoves(member.moves),
    }).pipe(map(({ pokemon, moves }) => this.toMember(pokemon, member, moves)));
  }

  private hydrateMoves(slots: readonly TeamPokemonMoveEmbed[]): Observable<readonly MoveRead[]> {
    if (slots.length === 0) {
      return of([]);
    }
    return forkJoin(slots.map((slot) => this.moveService.getOneMove({ id: slot.move.id })));
  }

  private toMember(
    pokemon: PokemonRead,
    source: TeamPokemonRead,
    hydratedMoves: readonly MoveRead[],
  ): TeamMember {
    return {
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
      artworkShiny: pokemon.artworkShiny ?? FALLBACK_ARTWORK_SHINY,
      primaryType: pokemon.primaryType,
      secondaryType: pokemon.secondaryType,
      species: pokemon.species,
      availableAbilities: pokemon.abilities,
      nickname: source.nickname ?? '',
      level: source.level,
      shiny: source.shiny,
      ability: source.ability,
      nature: source.nature,
      item: source.heldItem,
      teraType: source.teraType,
      evs: {
        hp: source.evHp,
        attack: source.evAtk,
        defense: source.evDef,
        specialAttack: source.evSpAtk,
        specialDefense: source.evSpDef,
        speed: source.evSpeed,
      },
      ivs: {
        hp: source.ivHp,
        attack: source.ivAtk,
        defense: source.ivDef,
        specialAttack: source.ivSpAtk,
        specialDefense: source.ivSpDef,
        speed: source.ivSpeed,
      },
      moves: this.toMoveSlots(source.moves, hydratedMoves),
    };
  }

  private toMoveSlots(
    sources: readonly TeamPokemonMoveEmbed[],
    hydrated: readonly MoveRead[],
  ): ReadonlyArray<MoveRead | null> {
    const slots: Array<MoveRead | null> = Array.from({ length: TEAM_MOVE_SLOT_COUNT }, () => null);
    sources.forEach((slot, index) => {
      const position = slot.slotPosition - 1;
      if (position < 0 || position >= TEAM_MOVE_SLOT_COUNT) {
        return;
      }
      slots[position] = hydrated[index] ?? null;
    });
    return slots;
  }

  private toDraft(team: TeamRead, members: readonly TeamMember[], asDraft: boolean): TeamDraft {
    return {
      name: team.name,
      isPrivate: asDraft ? true : !team.isPublic,
      members: this.padToRoster(members),
      sourceId: asDraft ? null : team.id,
    };
  }

  private padToRoster(members: readonly TeamMember[]): ReadonlyArray<TeamMember | null> {
    const slots: Array<TeamMember | null> = Array.from({ length: TEAM_SLOT_COUNT }, () => null);
    members.forEach((member, index) => {
      if (index < TEAM_SLOT_COUNT) {
        slots[index] = member;
      }
    });
    return slots;
  }
}

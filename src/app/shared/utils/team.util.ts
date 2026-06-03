import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamRead } from '@shared/interfaces/pokemon/team/team-read.interface';
import { TeamSummary } from '@shared/interfaces/pokemon/team/team-summary.interface';
import { TeamPokemonRead } from '@shared/interfaces/pokemon/team/team-pokemon-read.interface';

import { getTypeColor } from './get-type-color.util';
import { LikableTeam } from '@shared/interfaces/teams/likeable-team.interface';

export const TEAM_SLOT_COUNT = 6;
export const NEUTRAL_ACCENT = '#9aa1ad';

export function teamSlotsFilled(team: TeamSummary | TeamRead): number {
  if ('pokemon' in team) {
    return team.pokemon.length;
  }
  return team.pokemonSprites.length;
}

export function teamRosterAccent(team: TeamRead): string {
  const firstMember = team.pokemon[0];
  if (!firstMember) {
    return NEUTRAL_ACCENT;
  }
  return getTypeColor(firstMember.pokemon.primaryType.name);
}

export function teamTypeSpread(team: TeamRead): readonly TypeRead[] {
  const seen = new Set<number>();
  const spread: TypeRead[] = [];
  for (const member of team.pokemon) {
    collectTypes(member, seen, spread);
  }
  return spread;
}

export function toggleTeamLike<T extends LikableTeam>(team: T, liked: boolean): T {
  const delta = liked ? 1 : -1;
  return {
    ...team,
    likedByCurrentUser: liked,
    likeCount: team.likeCount + delta,
  };
}

function collectTypes(member: TeamPokemonRead, seen: Set<number>, target: TypeRead[]): void {
  const candidates = [member.pokemon.primaryType, member.pokemon.secondaryType];
  for (const type of candidates) {
    if (type && !seen.has(type.id)) {
      seen.add(type.id);
      target.push(type);
    }
  }
}

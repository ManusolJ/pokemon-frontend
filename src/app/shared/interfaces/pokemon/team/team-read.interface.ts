import { TeamPokemonRead } from './team-pokemon-read.interface';
import { UserSummary } from '@shared/interfaces/pokemon/user/user-summary.interface';

export interface TeamRead {
  id: number;
  name: string;
  slug: string;
  isPublic: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary;
  pokemon: TeamPokemonRead[];
  likedByCurrentUser: boolean;
}

import { UserSummary } from '@shared/interfaces/pokemon/user/user-summary.interface';

export interface TeamSummary {
  id: number;
  name: string;
  slug: string;
  isPublic: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary;
  pokemonSprites: string[];
  likedByCurrentUser: boolean;
}

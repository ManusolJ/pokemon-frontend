import { UserSummary } from '@shared/interfaces/pokemon/user/user-summary.interface';

export interface TeamSummary {
  id: number;
  name: string;
  isPublic: boolean;
  likeCount: number;
  createdAt: string;
  owner: UserSummary;
  pokemonSprites: string[];
  likedByCurrentUser: boolean;
}

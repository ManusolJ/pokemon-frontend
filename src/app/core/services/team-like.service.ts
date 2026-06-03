import { Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { TeamService } from './team.service';

@Injectable({ providedIn: 'root' })
export class TeamLikeService {
  private readonly teamService = inject(TeamService);

  toggleLike(teamId: number, nextLiked: boolean): Observable<void> {
    if (nextLiked) {
      return this.teamService.likeTeam(teamId);
    }
    return this.teamService.unlikeTeam(teamId);
  }
}

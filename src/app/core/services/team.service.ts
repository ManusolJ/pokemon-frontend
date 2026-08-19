import {
  ADMIN_ENDPOINT,
  TEAM_LIKE_ENDPOINT,
  TEAM_SELF_ENDPOINT,
  TEAM_PUBLIC_ID_ENDPOINT,
  TEAM_SELF_FILTER_ENDPOINT,
  TEAM_PUBLIC_FILTER_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { TeamRead } from '@shared/interfaces/pokemon/team/team-read.interface';
import { TeamPatch } from '@shared/interfaces/pokemon/team/team-patch.interface';
import { TeamCreate } from '@shared/interfaces/pokemon/team/team-create.interface';
import { TeamUpdate } from '@shared/interfaces/pokemon/team/team-update.interface';
import { TeamFilter } from '@shared/interfaces/pokemon/team/team-filter.interface';
import { TeamSummary } from '@shared/interfaces/pokemon/team/team-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT: string = 'teams/';

@Injectable({ providedIn: 'root' })
export class TeamService extends BaseApiService {
  getOnePublicTeam(filter: TeamFilter): Observable<TeamRead> {
    return this.post<TeamRead>(`${ENDPOINT}${TEAM_PUBLIC_ID_ENDPOINT}`, filter);
  }

  getPublicTeamPageWithFilter(
    filter: TeamFilter,
    pageable?: Pageable,
  ): Observable<Page<TeamSummary>> {
    return this.postPaged<Page<TeamSummary>>(
      `${ENDPOINT}${TEAM_PUBLIC_FILTER_ENDPOINT}`,
      filter,
      pageable,
    );
  }

  getOneSelfTeam(filter: TeamFilter): Observable<TeamRead> {
    return this.post<TeamRead>(`${ENDPOINT}${TEAM_SELF_ENDPOINT}`, filter);
  }

  getSelfTeamPageWithFilter(
    filter: TeamFilter,
    pageable?: Pageable,
  ): Observable<Page<TeamSummary>> {
    return this.postPaged<Page<TeamSummary>>(
      `${ENDPOINT}${TEAM_SELF_FILTER_ENDPOINT}`,
      filter,
      pageable,
    );
  }

  createTeam(teamCreationRequest: TeamCreate): Observable<TeamRead> {
    return this.post<TeamRead>(`${ENDPOINT}`, teamCreationRequest);
  }

  updateTeam(id: number, teamUpdateRequest: TeamUpdate): Observable<TeamRead> {
    return this.put<TeamRead>(`${ENDPOINT}${id}`, teamUpdateRequest);
  }

  patchTeam(id: number, teamPatchRequest: TeamPatch): Observable<TeamRead> {
    return this.patch<TeamRead>(`${ENDPOINT}${id}`, teamPatchRequest);
  }

  deleteTeam(id: number): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${id}`);
  }

  likeTeam(id: number): Observable<void> {
    return this.post<void>(`${ENDPOINT}${id}/${TEAM_LIKE_ENDPOINT}`, null);
  }

  unlikeTeam(id: number): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${id}/${TEAM_LIKE_ENDPOINT}`);
  }

  adminDeleteTeam(id: number): Observable<void> {
    return this.delete<void>(`${ENDPOINT}${ADMIN_ENDPOINT}${id}`);
  }
}

import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  SUMMARY_ENDPOINT,
  POKEMON_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { MoveRead } from '@shared/interfaces/pokemon/move/move-read.interface';
import { MoveEmbed } from '@shared/interfaces/pokemon/move/move-embed.interface';
import { MoveFilter } from '@shared/interfaces/pokemon/move/move-filter.interface';
import { MoveSummary } from '@shared/interfaces/pokemon/move/move-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'moves';

@Injectable({ providedIn: 'root' })
export class MoveService extends BaseApiService {
  getOneMove(filter: MoveFilter): Observable<MoveRead> {
    return this.post<MoveRead>(`${ENDPOINT}/${ID_ENDPOINT}`, filter);
  }

  getMoveCountWithFilter(filter: MoveFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_ENDPOINT}`, filter);
  }

  getMovePageWithFilter(filter: MoveFilter, pageable?: Pageable): Observable<Page<MoveRead>> {
    return this.postPaged<Page<MoveRead>>(`${ENDPOINT}/${FILTER_ENDPOINT}`, filter, pageable);
  }

  getMoveSummaryPageWithFilter(
    filter: MoveFilter,
    pageable?: Pageable,
  ): Observable<Page<MoveSummary>> {
    return this.postPaged<Page<MoveSummary>>(`${ENDPOINT}/${SUMMARY_ENDPOINT}`, filter, pageable);
  }

  getMovesForPokemon(pokemonId: number, pageable?: Pageable): Observable<Page<MoveEmbed>> {
    return this.getPaged<Page<MoveEmbed>>(`${ENDPOINT}/${POKEMON_ENDPOINT}/${pokemonId}`, pageable);
  }
}

import {
  ID_PARAMATER,
  COUNT_PARAMATER,
  FILTER_PARAMATER,
  SUMMARY_PARAMATER,
} from '@shared/constants/api.constants';

import { PokemonFilter } from '@shared/interfaces/pokemon/pokemon/pokemon-filter.interface';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { PokemonSummary } from '@shared/interfaces/pokemon/pokemon/pokemon-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'pokemon';

@Injectable({ providedIn: 'root' })
export class PokemonService extends BaseApiService {
  getOnePokemon(filter: PokemonFilter): Observable<PokemonRead> {
    return this.post<PokemonRead>(`${ENDPOINT}/${ID_PARAMATER}`, filter);
  }

  getPokemonCountWithFilter(filter: PokemonFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_PARAMATER}`, filter);
  }

  getPokemonPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<PokemonRead>> {
    return this.postPaged<Page<PokemonRead>>(`${ENDPOINT}/${FILTER_PARAMATER}`, filter, pageable);
  }

  getPokemonSummaryPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<PokemonSummary>> {
    return this.postPaged<Page<PokemonSummary>>(
      `${ENDPOINT}/${SUMMARY_PARAMATER}`,
      filter,
      pageable,
    );
  }
}

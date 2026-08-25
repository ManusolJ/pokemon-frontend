import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  SUMMARY_ENDPOINT,
} from '@shared/constants/api.constants';

import { PokemonFilter } from '@shared/interfaces/pokemon/pokemon/pokemon-filter.interface';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { PokemonRead } from '@shared/interfaces/pokemon/pokemon/pokemon-read.interface';
import { PokemonSummary } from '@shared/interfaces/pokemon/pokemon/pokemon-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'pokemon/';

@Injectable({ providedIn: 'root' })
export class PokemonService extends BaseApiService {
  getOnePokemon(filter: PokemonFilter): Observable<PokemonRead> {
    return this.post<PokemonRead>(`${ENDPOINT}${ID_ENDPOINT}`, filter);
  }

  getPokemonCountWithFilter(filter: PokemonFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${COUNT_ENDPOINT}`, filter);
  }

  getPokemonPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<PokemonRead>> {
    return this.postPaged<Page<PokemonRead>>(`${ENDPOINT}${FILTER_ENDPOINT}`, filter, pageable);
  }

  getPokemonSummaryPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<PokemonSummary>> {
    return this.postPaged<Page<PokemonSummary>>(`${ENDPOINT}${SUMMARY_ENDPOINT}`, filter, pageable);
  }
}

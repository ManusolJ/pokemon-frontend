import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  SUMMARY_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { SpeciesRead } from '@shared/interfaces/pokemon/pokemon/species-read.interface';
import { PokemonFilter } from '@shared/interfaces/pokemon/pokemon/pokemon-filter.interface';
import { SpeciesSummary } from '@shared/interfaces/pokemon/pokemon/species-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { computed, Injectable } from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

const ENDPOINT: string = 'species/';

@Injectable({ providedIn: 'root' })
export class SpeciesService extends BaseApiService {
  private readonly totalCountResource = rxResource({
    stream: () => this.getSpeciesCountWithFilter({}),
    defaultValue: 0,
  });

  readonly totalCount = computed(() => this.totalCountResource.value());

  getOneSpecies(filter: PokemonFilter): Observable<SpeciesRead> {
    return this.post<SpeciesRead>(`${ENDPOINT}${ID_ENDPOINT}`, filter);
  }

  getSpeciesCountWithFilter(filter: PokemonFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${COUNT_ENDPOINT}`, filter);
  }

  getSpeciesPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<SpeciesRead>> {
    return this.postPaged<Page<SpeciesRead>>(`${ENDPOINT}${FILTER_ENDPOINT}`, filter, pageable);
  }

  getSpeciesSummaryPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<SpeciesSummary>> {
    return this.postPaged<Page<SpeciesSummary>>(`${ENDPOINT}${SUMMARY_ENDPOINT}`, filter, pageable);
  }
}

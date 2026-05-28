import { PokemonFilter } from '@shared/interfaces/pokemon/pokemon/pokemon-filter.interface';
import { BaseApiService } from './base-api.service';

import { Injectable } from '@angular/core';
import { Pageable } from '@shared/interfaces/api/pageable.interface';
import { Observable } from 'rxjs';
import { SpeciesRead } from '@shared/interfaces/pokemon/pokemon/species-read.interface';
import {
  COUNT_PARAMATER,
  FILTER_PARAMATER,
  ID_PARAMATER,
  SUMMARY_PARAMATER,
} from '@shared/constants/api.constants';
import { Page } from '@shared/interfaces/api/page.interface';
import { SpeciesSummary } from '@shared/interfaces/pokemon/pokemon/species-summary.interface';

const ENDPOINT = 'species';

@Injectable({ providedIn: 'root' })
export class SpeciesService extends BaseApiService {
  getOneSpecies(filter: PokemonFilter): Observable<SpeciesRead> {
    return this.post<SpeciesRead>(`${ENDPOINT}/${ID_PARAMATER}`, filter);
  }

  getSpeciesCountWithFilter(filter: PokemonFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_PARAMATER}`, filter);
  }

  getSpeciesPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<SpeciesRead>> {
    return this.postPaged<Page<SpeciesRead>>(`${ENDPOINT}/${FILTER_PARAMATER}`, filter, pageable);
  }

  getSpeciesSummaryPageWithFilter(
    filter: PokemonFilter,
    pageable?: Pageable,
  ): Observable<Page<SpeciesSummary>> {
    return this.postPaged<Page<SpeciesSummary>>(
      `${ENDPOINT}/${SUMMARY_PARAMATER}`,
      filter,
      pageable,
    );
  }
}

import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  SUMMARY_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { AbilityRead } from '@shared/interfaces/pokemon/ability/ability-read.interface';
import { AbilityFilter } from '@shared/interfaces/pokemon/ability/ability-filter.interface';
import { AbilitySummary } from '@shared/interfaces/pokemon/ability/ability-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'ability/';

@Injectable({ providedIn: 'root' })
export class AbilityService extends BaseApiService {
  getOneAbility(filter: AbilityFilter): Observable<AbilityRead> {
    return this.post<AbilityRead>(`${ENDPOINT}${ID_ENDPOINT}`, filter);
  }

  getAbilityCountWithFilter(filter: AbilityFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${COUNT_ENDPOINT}`, filter);
  }

  getAbilitySummaryPageWithFilter(filter: AbilityFilter): Observable<Page<AbilitySummary>> {
    return this.postPaged<Page<AbilitySummary>>(`${ENDPOINT}${SUMMARY_ENDPOINT}`, filter);
  }

  getAbilityPageWithFilter(
    filter: AbilityFilter,
    pageable?: Pageable,
  ): Observable<Page<AbilityRead>> {
    return this.postPaged<Page<AbilityRead>>(`${ENDPOINT}${FILTER_ENDPOINT}`, filter, pageable);
  }
}

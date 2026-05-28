import { ID_PARAMATER, COUNT_PARAMATER, FILTER_PARAMATER } from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { NatureRead } from '@shared/interfaces/pokemon/nature/nature-read.interface';
import { NatureFilter } from '@shared/interfaces/pokemon/nature/nature-filter.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'natures';

@Injectable({ providedIn: 'root' })
export class NatureService extends BaseApiService {
  getOneNature(filter: NatureFilter): Observable<NatureRead> {
    return this.post<NatureRead>(`${ENDPOINT}/${ID_PARAMATER}`, filter);
  }

  getNatureCountWithFilter(filter: NatureFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_PARAMATER}`, filter);
  }

  getNaturePageWithFilter(filter: NatureFilter, pageable?: Pageable): Observable<Page<NatureRead>> {
    return this.postPaged<Page<NatureRead>>(`${ENDPOINT}/${FILTER_PARAMATER}`, filter, pageable);
  }
}

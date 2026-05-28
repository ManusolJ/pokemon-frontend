import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  EFFECTIVENESS_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TypeFilter } from '@shared/interfaces/pokemon/type/type-filter.interface';
import { TypeEffectivenessRead } from '@shared/interfaces/pokemon/type/type-effectiveness-read.interface';
import { TypeEffectivenessFilter } from '@shared/interfaces/pokemon/type/type-effectiveness-filter.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT: string = 'types/';

@Injectable({ providedIn: 'root' })
export class TypeService extends BaseApiService {
  getOneType(filter: TypeFilter): Observable<TypeRead> {
    return this.post(`${ENDPOINT}${ID_ENDPOINT}`, filter);
  }

  getTypeCountWithFilter(filter: TypeFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${COUNT_ENDPOINT}`, filter);
  }

  getAllTypesWithFilter(filter: TypeFilter, pageable?: Pageable): Observable<Page<TypeRead>> {
    return this.postPaged<Page<TypeRead>>(`${ENDPOINT}${FILTER_ENDPOINT}`, filter, pageable);
  }

  getEffectivenessMatrix(
    filter: TypeEffectivenessFilter,
    pageable?: Pageable,
  ): Observable<Page<TypeEffectivenessRead>> {
    return this.postPaged<Page<TypeEffectivenessRead>>(
      `${ENDPOINT}${EFFECTIVENESS_ENDPOINT}`,
      filter,
      pageable,
    );
  }
}

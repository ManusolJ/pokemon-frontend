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

import { catchError, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'types/';

const TYPE_LIST_REPLAY_BUFFER_SIZE = 1;

@Injectable({ providedIn: 'root' })
export class TypeService extends BaseApiService {
  private allTypes: Observable<readonly TypeRead[]> | null = null;

  getAllTypes(): Observable<readonly TypeRead[]> {
    this.allTypes ??= this.fetchAllTypes().pipe(
      catchError((error: unknown) => {
        this.allTypes = null;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: TYPE_LIST_REPLAY_BUFFER_SIZE, refCount: false }),
    );

    return this.allTypes;
  }

  private fetchAllTypes(): Observable<readonly TypeRead[]> {
    return this.getTypeCountWithFilter({}).pipe(
      switchMap((count) =>
        count === 0
          ? of<readonly TypeRead[]>([])
          : this.getTypePageWithFilter(
              {},
              { page: 0, size: count, sort: 'name', direction: 'ASC' },
            ).pipe(map((page) => page.content)),
      ),
    );
  }

  getOneType(filter: TypeFilter): Observable<TypeRead> {
    return this.post<TypeRead>(`${ENDPOINT}${ID_ENDPOINT}`, filter);
  }

  getTypeCountWithFilter(filter: TypeFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}${COUNT_ENDPOINT}`, filter);
  }

  getTypePageWithFilter(filter: TypeFilter, pageable?: Pageable): Observable<Page<TypeRead>> {
    return this.postPaged<Page<TypeRead>>(`${ENDPOINT}${FILTER_ENDPOINT}`, filter, pageable);
  }

  getTypeEffectivenessPageWithFilter(
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

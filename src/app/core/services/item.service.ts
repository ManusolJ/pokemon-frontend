import {
  ID_ENDPOINT,
  COUNT_ENDPOINT,
  FILTER_ENDPOINT,
  SUMMARY_ENDPOINT,
} from '@shared/constants/api.constants';

import { Page } from '@shared/interfaces/api/page.interface';
import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { ItemRead } from '@shared/interfaces/pokemon/item/item-read.interface';
import { ItemFilter } from '@shared/interfaces/pokemon/item/item-filter.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'item';

@Injectable({ providedIn: 'root' })
export class ItemService extends BaseApiService {
  getOneItem(filter: ItemFilter): Observable<ItemRead> {
    return this.post<ItemRead>(`${ENDPOINT}/${ID_ENDPOINT}`, filter);
  }

  getItemCountWithFilter(filter: ItemFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_ENDPOINT}`, filter);
  }

  getItemPageWithFilter(filter: ItemFilter, pageable?: Pageable): Observable<Page<ItemRead>> {
    return this.postPaged<Page<ItemRead>>(`${ENDPOINT}/${FILTER_ENDPOINT}`, filter, pageable);
  }

  getItemSummaryPageWithFilter(
    filter: ItemFilter,
    pageable?: Pageable,
  ): Observable<Page<ItemSummary>> {
    return this.postPaged<Page<ItemSummary>>(`${ENDPOINT}/${SUMMARY_ENDPOINT}`, filter, pageable);
  }
}

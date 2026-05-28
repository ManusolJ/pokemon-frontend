import {
  COUNT_PARAMATER,
  FILTER_PARAMATER,
  ID_PARAMATER,
  SUMMARY_PARAMATER,
} from '@shared/constants/api.constants';

import { ItemRead } from '@shared/interfaces/pokemon/item/item-read.interface';
import { ItemFilter } from '@shared/interfaces/pokemon/item/item-filter.interface';

import { BaseApiService } from './base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { Pageable } from '@shared/interfaces/api/pageable.interface';
import { Page } from '@shared/interfaces/api/page.interface';
import { ItemSummary } from '@shared/interfaces/pokemon/item/item-summary.interface';

const ENDPOINT = 'item';

@Injectable({ providedIn: 'root' })
export class ItemService extends BaseApiService {
  getOneItem(filter: ItemFilter): Observable<ItemRead> {
    return this.post<ItemRead>(`${ENDPOINT}/${ID_PARAMATER}`, filter);
  }

  getItemCountWithFilter(filter: ItemFilter): Observable<number> {
    return this.post<number>(`${ENDPOINT}/${COUNT_PARAMATER}`, filter);
  }

  getItemPageWithFilter(filter: ItemFilter, pageable?: Pageable): Observable<Page<ItemRead>> {
    return this.postPaged<Page<ItemRead>>(`${ENDPOINT}/${FILTER_PARAMATER}`, filter, pageable);
  }

  getItemSummaryPageWithFilter(
    filter: ItemFilter,
    pageable?: Pageable,
  ): Observable<Page<ItemSummary>> {
    return this.postPaged<Page<ItemSummary>>(`${ENDPOINT}/${SUMMARY_PARAMATER}`, filter, pageable);
  }
}

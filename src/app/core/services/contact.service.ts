import { ContactRequest } from '@shared/interfaces/misc/contact-request.interface';

import { BaseApiService } from '@core/services/base-api.service';

import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

const ENDPOINT = 'contact';

@Injectable({ providedIn: 'root' })
export class ContactService extends BaseApiService {
  sendMessage(request: ContactRequest): Observable<void> {
    return this.post<void>(`${ENDPOINT}`, request);
  }
}

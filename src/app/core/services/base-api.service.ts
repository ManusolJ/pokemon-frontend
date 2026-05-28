import { environment } from '@environments/environment';

import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API_URL: string = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.url(endpoint), {
      params,
    });
  }

  protected post<T>(endpoint: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.post<T>(this.url(endpoint), body, {
      params,
    });
  }

  protected put<T>(endpoint: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.put<T>(this.url(endpoint), body, {
      params,
    });
  }

  protected patch<T>(endpoint: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http.patch<T>(this.url(endpoint), body, {
      params,
    });
  }

  protected delete<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(this.url(endpoint), {
      params,
    });
  }

  protected getPaged<T>(endpoint: string, pageable?: Pageable): Observable<T> {
    return this.get<T>(endpoint, this.pageParams(pageable));
  }

  protected postPaged<T>(endpoint: string, body: unknown, pageable?: Pageable): Observable<T> {
    return this.post<T>(endpoint, body, this.pageParams(pageable));
  }

  private pageParams(pageable?: Pageable): HttpParams | undefined {
    if (!pageable) {
      return undefined;
    }

    let params = new HttpParams().set('page', pageable.page).set('size', pageable.size);

    if (pageable.sort) {
      params = params.set('sort', `${pageable.sort}, ${pageable.direction ?? 'ASC'}`);
    }

    return params;
  }

  private url(endpoint: string): string {
    return `${API_URL}/${endpoint}`;
  }
}

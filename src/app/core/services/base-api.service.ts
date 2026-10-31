import { environment } from '@environments/environment';

import { Pageable } from '@shared/interfaces/api/pageable.interface';

import { Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';

const API_URL: string = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected get<T>(endpoint: string, params?: HttpParams, context?: HttpContext): Observable<T> {
    return this.http.get<T>(this.url(endpoint), { params, context });
  }

  protected post<T>(
    endpoint: string,
    body: unknown,
    params?: HttpParams,
    context?: HttpContext,
  ): Observable<T> {
    return this.http.post<T>(this.url(endpoint), body, { params, context });
  }

  protected put<T>(
    endpoint: string,
    body: unknown,
    params?: HttpParams,
    context?: HttpContext,
  ): Observable<T> {
    return this.http.put<T>(this.url(endpoint), body, { params, context });
  }

  protected patch<T>(
    endpoint: string,
    body: unknown,
    params?: HttpParams,
    context?: HttpContext,
  ): Observable<T> {
    return this.http.patch<T>(this.url(endpoint), body, { params, context });
  }

  protected delete<T>(endpoint: string, params?: HttpParams, context?: HttpContext): Observable<T> {
    return this.http.delete<T>(this.url(endpoint), { params, context });
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

    const direction = pageable.direction ?? 'ASC';
    for (const field of [pageable.sort, ...(pageable.thenSort ?? [])]) {
      if (field) {
        params = params.append('sort', `${field},${direction}`);
      }
    }

    return params;
  }

  private url(endpoint: string): string {
    return `${API_URL}/${endpoint.replace(/\/+$/, '')}`;
  }
}

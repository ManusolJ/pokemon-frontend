import { AuthService } from './auth.service';
import { TokenService } from './token.service';

import {
  map,
  tap,
  EMPTY,
  defer,
  concat,
  finalize,
  catchError,
  Observable,
  throwError,
  shareReplay,
  ignoreElements,
} from 'rxjs';

import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  private inFlight: Observable<string> | null = null;

  refresh(): Observable<string> {
    if (!this.tokenService.hasRefreshToken()) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.inFlight ??= this.authService.refreshAccessToken().pipe(
      map((response) => response.accessToken),
      tap({
        complete: () => this.release(),
        error: () => this.release(),
      }),
      finalize(() => this.release()),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.inFlight;
  }

  renewAfterInFlight(): Observable<string> {
    const pending = this.inFlight;

    if (!pending) {
      return this.refresh();
    }

    return concat(
      pending.pipe(
        ignoreElements(),
        catchError(() => EMPTY),
      ),
      defer(() => this.refresh()),
    );
  }

  private release(): void {
    this.inFlight = null;
  }
}

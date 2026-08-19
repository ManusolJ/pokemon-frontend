import { AuthService } from './auth.service';
import { TokenService } from './token.service';

import { finalize, map, Observable, shareReplay, throwError } from 'rxjs';

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
      finalize(() => (this.inFlight = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.inFlight;
  }
}

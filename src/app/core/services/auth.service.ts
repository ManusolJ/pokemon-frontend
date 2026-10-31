import {
  LOGIN_ENDPOINT,
  LOGOUT_ENDPOINT,
  REFRESH_ENDPOINT,
  REGISTER_ENDPOINT,
  PASSWORD_RESET_ENDPOINT,
  PASSWORD_RESET_REQUEST_ENDPOINT,
} from '@shared/constants/api.constants';

import { LoginRequest } from '@shared/interfaces/auth/login-request.interface';
import { TokenResponse } from '@shared/interfaces/auth/token-response.interface';
import { RegisterRequest } from '@shared/interfaces/auth/register-request.interface';
import { PasswordResetRequest } from '@shared/interfaces/auth/password-reset-request.interface';
import { PasswordResetConfirmation } from '@shared/interfaces/auth/password-reset-confirmation.interface';

import { silentErrors } from '@core/http/http-context';

import { TokenService } from './token.service';
import { BaseApiService } from './base-api.service';
import { TeamBuilderStateService } from './team-builder-state.service';

import { defer, Observable, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

const ENDPOINT = 'auth/';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  private readonly tokenService = inject(TokenService);
  private readonly builderState = inject(TeamBuilderStateService);

  readonly isAuthenticated = this.tokenService.isAuthenticated;

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.post<TokenResponse>(
      `${ENDPOINT}${LOGIN_ENDPOINT}`,
      request,
      undefined,
      silentErrors(),
    ).pipe(tap((response) => this.tokenService.setTokens(response)));
  }

  logout(): Observable<void> {
    return defer(() => {
      const refreshToken = this.tokenService.getRefreshToken();
      this.tokenService.clearTokens();
      this.builderState.reset();
      return this.post<void>(
        `${ENDPOINT}${LOGOUT_ENDPOINT}`,
        { refreshToken },
        undefined,
        silentErrors(),
      );
    });
  }

  signOut(): void {
    this.logout().subscribe({ error: () => {} });
  }

  register(request: RegisterRequest): Observable<TokenResponse> {
    return this.post<TokenResponse>(
      `${ENDPOINT}${REGISTER_ENDPOINT}`,
      request,
      undefined,
      silentErrors(),
    ).pipe(tap((response) => this.tokenService.setTokens(response)));
  }

  refreshAccessToken(): Observable<TokenResponse> {
    return defer(() =>
      this.post<TokenResponse>(
        `${ENDPOINT}${REFRESH_ENDPOINT}`,
        { refreshToken: this.tokenService.getRefreshToken() },
        undefined,
        silentErrors(),
      ).pipe(tap((response) => this.tokenService.setTokens(response))),
    );
  }

  resetPassword(confirmation: PasswordResetConfirmation): Observable<void> {
    return this.post<void>(
      `${ENDPOINT}${PASSWORD_RESET_ENDPOINT}`,
      confirmation,
      undefined,
      silentErrors(),
    );
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.post<void>(
      `${ENDPOINT}${PASSWORD_RESET_REQUEST_ENDPOINT}`,
      request,
      undefined,
      silentErrors(),
    );
  }
}

import {
  LOGIN_ENDPOINT,
  REFRESH_ENDPOINT,
  REGISTER_ENDPOINT,
  PASSWORD_RESET_ENDPOINT,
  PASSWORD_RESET_REQUEST_ENDPOINT,
  LOGOUT_ENDPOINT,
} from '@shared/constants/api.constants';

import { LoginRequest } from '@shared/interfaces/auth/login-request.interface';
import { TokenResponse } from '@shared/interfaces/auth/token-response.interface';
import { RegisterRequest } from '@shared/interfaces/auth/register-request.interface';
import { PasswordResetRequest } from '@shared/interfaces/auth/password-reset-request.interface';
import { PasswordResetConfirmation } from '@shared/interfaces/auth/password-reset-confirmation.interface';

import { TokenService } from './token.service';
import { BaseApiService } from './base-api.service';

import { finalize, Observable, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

const ENDPOINT: string = 'auth/';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  private readonly tokenService = inject(TokenService);

  readonly isAuthenticated = this.tokenService.isAuthenticated;

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.post<TokenResponse>(`${ENDPOINT}${LOGIN_ENDPOINT}`, request).pipe(
      tap((response) => this.tokenService.setTokens(response)),
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();

    return this.post<void>(`${ENDPOINT}${LOGOUT_ENDPOINT}`, { refreshToken }).pipe(
      finalize(() => this.tokenService.clearTokens()),
    );
  }

  register(request: RegisterRequest) {
    return this.post<TokenResponse>(`${ENDPOINT}${REGISTER_ENDPOINT}`, request).pipe(
      tap((response) => this.tokenService.setTokens(response)),
    );
  }

  refreshAccessToken(): Observable<TokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.post<TokenResponse>(`${ENDPOINT}${REFRESH_ENDPOINT}`, { refreshToken }).pipe(
      tap((response) => this.tokenService.setTokens(response)),
    );
  }

  resetPassword(confirmation: PasswordResetConfirmation): Observable<void> {
    return this.post<void>(`${ENDPOINT}${PASSWORD_RESET_ENDPOINT}`, confirmation);
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.post<void>(`${ENDPOINT}${PASSWORD_RESET_REQUEST_ENDPOINT}`, request);
  }
}

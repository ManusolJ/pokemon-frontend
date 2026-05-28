import { JwtPayload } from '@shared/interfaces/auth/jwt-payload.interface';
import { TokenResponse } from '@shared/interfaces/auth/token-response.interface';

import { jwtDecode } from 'jwt-decode';

import { computed, Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'accessToken';
const EXPIRES_AT_KEY = 'tokenExpiresAt';
const DEFAULT_EXPIRY_BUFFER_MS = 30_000;
const REFRESH_TOKEN_KEY = 'refreshToken';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly accessToken = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  readonly isAuthenticated = computed<boolean>(() => this.accessToken() !== null);

  hasRole(role: string): boolean {
    const token = this.accessToken();
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        if (payload && payload.authorities.length !== 0) {
          return payload.authorities.includes(role);
        } else {
          return false;
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  getUsername(): string | null {
    const token = this.accessToken();

    if (token) {
      try {
        return jwtDecode(token).sub ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(response: TokenResponse): void {
    const expiresAt = Date.now() + response.expiresIn;

    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    this.accessToken.set(response.accessToken);
  }

  clearTokens(): void {
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    this.accessToken.set(null);
  }

  willExpireSoon(bufferMs: number = DEFAULT_EXPIRY_BUFFER_MS): boolean {
    const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) ?? '0');
    return Date.now() + bufferMs >= expiresAt;
  }
}

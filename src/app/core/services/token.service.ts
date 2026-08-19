import { JwtPayload } from '@shared/interfaces/auth/jwt-payload.interface';
import { TokenResponse } from '@shared/interfaces/auth/token-response.interface';

import { jwtDecode } from 'jwt-decode';

import { computed, Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'accessToken';
const EXPIRES_AT_KEY = 'tokenExpiresAt';
const DEFAULT_EXPIRY_BUFFER_MS = 30_000;
const REFRESH_TOKEN_KEY = 'refreshToken';

const MS_PER_SECOND = 1_000;

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly accessToken = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  readonly isAuthenticated = computed<boolean>(() => this.accessToken() !== null);

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        this.accessToken.set(localStorage.getItem(ACCESS_TOKEN_KEY));
      }
    });
  }

  hasRole(role: string): boolean {
    const payload = this.decode();
    return payload ? payload.authorities.includes(role) : false;
  }

  getUsername(): string | null {
    return this.decode()?.sub ?? null;
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasRefreshToken(): boolean {
    return this.getRefreshToken() !== null;
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
    const expiresAt = this.expiresAt();
    return expiresAt === null ? false : Date.now() + bufferMs >= expiresAt;
  }

  private expiresAt(): number | null {
    const stored = Number(localStorage.getItem(EXPIRES_AT_KEY));
    if (Number.isFinite(stored) && stored > 0) {
      return stored;
    }

    const exp = this.decode()?.exp;
    return typeof exp === 'number' ? exp * MS_PER_SECOND : null;
  }

  private decode(): JwtPayload | null {
    const token = this.accessToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}

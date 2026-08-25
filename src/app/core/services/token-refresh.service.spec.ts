import { TokenResponse } from '@shared/interfaces/auth/token-response.interface';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { TokenRefreshService } from './token-refresh.service';

import { Observable, Subject, throwError } from 'rxjs';

import { TestBed } from '@angular/core/testing';

/**
 * Renewal has to collapse into exactly one request. The API rotates refresh tokens and treats
 * a replay of a spent one as a stolen-token event, revoking every session in the family — so a
 * duplicated renewal doesn't waste a call, it signs the user out.
 */
describe('TokenRefreshService', () => {
  let refreshCalls: number;
  let hasRefreshToken: boolean;
  let responses: Subject<TokenResponse>;

  const response = (accessToken: string): TokenResponse => ({
    accessToken,
    refreshToken: 'next-refresh',
    expiresIn: 900_000,
  });

  beforeEach(() => {
    refreshCalls = 0;
    responses = new Subject<TokenResponse>();
    hasRefreshToken = true;

    const authService = {
      refreshAccessToken: (): Observable<TokenResponse> => {
        refreshCalls++;
        return responses.asObservable();
      },
    };

    TestBed.configureTestingModule({
      providers: [
        TokenRefreshService,
        { provide: AuthService, useValue: authService },
        { provide: TokenService, useValue: { hasRefreshToken: () => hasRefreshToken } },
      ],
    });
  });

  const service = () => TestBed.inject(TokenRefreshService);

  it('issues a single request when several callers overlap', () => {
    const seen: string[] = [];
    const target = service();

    target.refresh().subscribe((token) => seen.push(token));
    target.refresh().subscribe((token) => seen.push(token));
    target.refresh().subscribe((token) => seen.push(token));

    responses.next(response('fresh'));
    responses.complete();

    expect(refreshCalls).toBe(1);
    expect(seen).toEqual(['fresh', 'fresh', 'fresh']);
  });

  it('gives every waiter the new token, never a previously issued one', () => {
    const target = service();
    let first: string | undefined;

    target.refresh().subscribe((token) => (first = token));
    responses.next(response('first-token'));
    responses.complete();

    responses = new Subject<TokenResponse>();
    let second: string | undefined;

    target.refresh().subscribe((token) => (second = token));
    responses.next(response('second-token'));
    responses.complete();

    expect(first).toBe('first-token');
    expect(second).toBe('second-token');
    expect(refreshCalls).toBe(2);
  });

  it('starts a fresh request after the previous one failed', () => {
    const target = service();
    const errors: unknown[] = [];

    responses.error(new Error('refresh rejected'));
    target.refresh().subscribe({ error: (error) => errors.push(error) });

    responses = new Subject<TokenResponse>();
    let recovered: string | undefined;

    target.refresh().subscribe((token) => (recovered = token));
    responses.next(response('recovered'));
    responses.complete();

    expect(errors).toHaveLength(1);
    expect(recovered).toBe('recovered');
  });

  it('does not strand the in-flight slot when a caller unsubscribes', () => {
    const target = service();

    const abandoned = target.refresh().subscribe();
    abandoned.unsubscribe();

    let token: string | undefined;
    target.refresh().subscribe((value) => (token = value));

    responses.next(response('still-arrives'));
    responses.complete();

    expect(refreshCalls).toBe(1);
    expect(token).toBe('still-arrives');
  });

  it('fails without calling the API when no refresh token is held', () => {
    hasRefreshToken = false;
    const errors: unknown[] = [];

    service()
      .refresh()
      .subscribe({ error: (error) => errors.push(error) });

    expect(refreshCalls).toBe(0);
    expect(errors).toHaveLength(1);
  });

  it('propagates the failure to every waiting caller', () => {
    const target = service();
    const errors: unknown[] = [];

    target.refresh().subscribe({ error: (error) => errors.push(error) });
    target.refresh().subscribe({ error: (error) => errors.push(error) });

    responses.error(new Error('family revoked'));

    expect(refreshCalls).toBe(1);
    expect(errors).toHaveLength(2);
  });

  it('renewAfterInFlight starts a new request rather than sharing the pending one', () => {
    const target = service();
    let shared: string | undefined;
    let queued: string | undefined;

    target.refresh().subscribe((token) => (shared = token));
    target.renewAfterInFlight().subscribe((token) => (queued = token));

    const firstCycle = responses;
    responses = new Subject<TokenResponse>();

    firstCycle.next(response('in-flight'));
    firstCycle.complete();

    responses.next(response('minted-after'));
    responses.complete();

    expect(shared).toBe('in-flight');
    expect(queued).toBe('minted-after');
    expect(refreshCalls).toBe(2);
  });

  it('renewAfterInFlight refreshes immediately when nothing is pending', () => {
    const target = service();
    let token: string | undefined;

    target.renewAfterInFlight().subscribe((value) => (token = value));
    responses.next(response('fresh'));
    responses.complete();

    expect(refreshCalls).toBe(1);
    expect(token).toBe('fresh');
  });

  it('renewAfterInFlight still renews when the pending call failed', () => {
    const target = service();

    target.refresh().subscribe({ error: () => {} });

    let recovered: string | undefined;
    target.renewAfterInFlight().subscribe((token) => (recovered = token));

    const failing = responses;
    responses = new Subject<TokenResponse>();

    failing.error(new Error('refresh rejected'));

    responses.next(response('recovered'));
    responses.complete();

    expect(recovered).toBe('recovered');
    expect(refreshCalls).toBe(2);
  });

  it('surfaces an immediate failure to the caller', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TokenRefreshService,
        {
          provide: AuthService,
          useValue: { refreshAccessToken: () => throwError(() => new Error('down')) },
        },
        { provide: TokenService, useValue: { hasRefreshToken: () => true } },
      ],
    });

    const errors: unknown[] = [];
    TestBed.inject(TokenRefreshService)
      .refresh()
      .subscribe({ error: (error) => errors.push(error) });

    expect(errors).toHaveLength(1);
  });
});

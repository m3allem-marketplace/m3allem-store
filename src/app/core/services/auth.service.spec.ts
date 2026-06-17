// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockUser: User = {
  _id: 'user123',
  name: 'Test Supplier',
  email: 'supplier@m3allem.com',
  role: 'supplier',
  createdAt: '2026-01-01T00:00:00.000Z'
};

/** Build a minimal 3-part JWT whose payload is JSON of `data`. */
function makeToken(data: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(data)}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  function configure(): void {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.clear();
    configure();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // ------------------------------------------------------------------
  // Basic creation
  // ------------------------------------------------------------------
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ------------------------------------------------------------------
  // login()
  // ------------------------------------------------------------------
  describe('login()', () => {
    it('POSTs to /auth/login, saves token, and emits the user from response body', () => {
      const token = makeToken({ user: mockUser, exp: Math.floor(Date.now() / 1000) + 3600 });

      service.login('supplier@m3allem.com', 'secret').subscribe(() => {
        expect(service.getToken()).toBe(token);
        expect(service.isLoggedIn()).toBe(true);
        expect(service.currentUser$.value).toEqual(mockUser);
      });

      const req = http.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'supplier@m3allem.com', password: 'secret' });
      req.flush({ token, user: mockUser });
    });
  });

  // ------------------------------------------------------------------
  // logout()
  // ------------------------------------------------------------------
  describe('logout()', () => {
    it('removes token from localStorage and emits null', () => {
      const token = makeToken({ user: mockUser });
      localStorage.setItem('m3allem_token', token);
      service.currentUser$.next(mockUser);

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
      expect(service.currentUser$.value).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // Session restoration on startup
  // ------------------------------------------------------------------
  describe('session restoration', () => {
    it('restores session on startup when a valid non-expired token is present', () => {
      TestBed.resetTestingModule();
      const token = makeToken({ user: mockUser, exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('m3allem_token', token);

      configure(); // fresh service construction triggers restoreSession()

      expect(service.currentUser$.value).toEqual(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('clears expired token on startup and leaves currentUser$ as null', () => {
      TestBed.resetTestingModule();
      const token = makeToken({ user: mockUser, exp: Math.floor(Date.now() / 1000) - 3600 });
      localStorage.setItem('m3allem_token', token);

      configure();

      expect(service.currentUser$.value).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('m3allem_token')).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // hasRole()
  // ------------------------------------------------------------------
  describe('hasRole()', () => {
    it('returns true when the logged-in user has the queried role', () => {
      service.currentUser$.next(mockUser); // role: 'supplier'
      expect(service.hasRole('supplier')).toBe(true);
    });

    it('returns false when the logged-in user has a different role', () => {
      service.currentUser$.next(mockUser);
      expect(service.hasRole('client')).toBe(false);
    });

    it('returns false when no user is logged in', () => {
      service.currentUser$.next(null);
      expect(service.hasRole('supplier')).toBe(false);
    });
  });
});

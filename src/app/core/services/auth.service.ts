import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'm3allem_token';
  private readonly http = inject(HttpClient);

  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string; user?: User }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response?.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            const user = response.user ?? this.decodeToken(response.token);
            if (user) {
              this.currentUser$.next(user);
            }
          }
        }),
        map(() => undefined)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Alias used by JwtInterceptor */
  getJwtToken(): string | null {
    return this.getToken();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.currentUser$.value?.role === role;
  }


  private restoreSession(): void {
    const token = this.getToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    const user = this.decodeToken(token);
    if (user) {
      this.currentUser$.next(user);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJwtPayload(token);
      if (payload?.['exp']) {
        return (payload['exp'] as number) * 1000 < Date.now();
      }
      return false;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const data = this.parseJwtPayload(token);
      if (!data) return null;

      // Backend may embed the full user object under a 'user' key, or flatten it
      if (data['user']) return data['user'] as User;

      const { _id, id, name, email, role, phone, createdAt } = data as Record<string, unknown>;
      if (email) {
        return {
          _id: (_id ?? id ?? '') as string,
          name: (name ?? '') as string,
          email: email as string,
          role: (role ?? 'client') as User['role'],
          phone: phone as string | undefined,
          createdAt: (createdAt ?? '') as string
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private parseJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  }
}

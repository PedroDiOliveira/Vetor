import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'vetor.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly authenticated = signal(this.readSession());

  login(password: string): boolean {
    if (password === environment.boardPassword) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      this.authenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.authenticated.set(false);
  }

  isAuthenticated(): boolean {
    return this.readSession();
  }

  private readSession(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}

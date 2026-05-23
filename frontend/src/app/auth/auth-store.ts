import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  nombre: string;
  token: string; 
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private _user = signal<User | null>(this.getUserFromStorage());
  
  get user() {
    return this._user.asReadonly();
  }

  get isAuthenticated() {
    return this._user() !== null;
  }

  get token(): string | null {
    return this._user()?.token ?? null;
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  login(user: User) {
    localStorage.setItem('user', JSON.stringify(user)); 
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this._user.set(null);
  }
}
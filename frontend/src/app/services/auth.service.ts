import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4000/auth';

  login(credentials: { nombre: string; clave: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }
}
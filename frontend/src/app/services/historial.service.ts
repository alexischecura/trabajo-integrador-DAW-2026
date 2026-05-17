import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/historial';

  getAll(entidad?: string): Observable<any[]> {
    let params = new HttpParams();
    if (entidad) {
      params = params.set('entidad', entidad);
    }
    return this.http.get<any[]>(this.baseUrl, { params });
  }
}

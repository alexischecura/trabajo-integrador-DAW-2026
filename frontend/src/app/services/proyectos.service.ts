import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/proyectos';

  getAll(params?: Record<string, any>): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<any>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  create(data: { nombre: string; estado?: string; id_cliente?: number }): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: { nombre?: string; estado?: string; id_cliente?: number | null }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
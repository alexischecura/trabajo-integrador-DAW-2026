import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4000/tareas';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getByProyecto(proyectoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?id_proyecto=${proyectoId}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  create(data: { descripcion: string; estado?: string; id_proyecto: number }): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: { descripcion?: string; estado?: string; id_proyecto?: number }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
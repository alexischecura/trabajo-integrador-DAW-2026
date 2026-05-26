import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../services/clientes.service';
import { CommonModule } from '@angular/common';
import { FilterPanelComponent } from '../../shared/filter-panel';
import { FormsModule } from '@angular/forms';
import { ProyectosService } from '../../services/proyectos.service';
import { TareasService } from '../../services/tareas.service';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, FilterPanelComponent],
  template: `
    <div class="container">
      <h1>Proyectos</h1>

      <app-filter-panel
        [title]="'Búsqueda de proyectos'"
        [filters]="filters"
        [showClientFilter]="true"
        [clientOptions]="clientes"
        [fields]="filterFields"
        (search)="buscar()"
        (reset)="resetFilters()"
      ></app-filter-panel>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha Fin</th>
              <th>Situación</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (proyecto of proyectos; track proyecto.id) {
              <tr>
                <td>{{ proyecto.id }}</td>
                <td>{{ proyecto.nombre }}</td>
                <td><span class="badge" [class]="proyecto.estado">{{ proyecto.estado }}</span></td>
                <td>{{ proyecto.fecha_fin ? (proyecto.fecha_fin | date:'dd/MM/yyyy') : '-' }}</td>
                <td>
                  @if (proyecto.fecha_fin && proyecto.estado === 'ACTIVO') {
                    <span class="badge" [class]="getSituacion(proyecto).clase">{{ getSituacion(proyecto).texto }}</span>
                  }
                </td>
                <td>{{ proyecto.cliente?.nombre || '-' }}</td>
                <td>
                  <button class="btn btn-primary" (click)="editar(proyecto)">Editar</button>
                  <button class="btn btn-danger" (click)="eliminar(proyecto.id)">Eliminar</button>
                  <button class="btn btn-secondary" [routerLink]="['/layout/tareas', proyecto.id]">Tareas</button>
                  <button class="btn btn-success" [routerLink]="['/layout/tablero', proyecto.id]">Tablero</button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pagination">
          <button class="btn btn-secondary" type="button" (click)="changePage(-1)" [disabled]="page <= 1">Anterior</button>
          <span>Página {{ page }} de {{ totalPages }}</span>
          <button class="btn btn-secondary" type="button" (click)="changePage(1)" [disabled]="page >= totalPages">Siguiente</button>
        </div>
      </div>

      <div class="card">
        <h2>{{ editando ? 'Editar' : 'Nuevo' }} Proyecto</h2>
        <form (ngSubmit)="guardar()">
          <div class="form-group">
            <label>Nombre</label>
            <input
              type="text"
              [(ngModel)]="form.nombre"
              name="nombre"
              [class.input-error]="submitted && !form.nombre?.trim()"
            />
            @if (submitted && !form.nombre?.trim()) {
              <span class="error-msg">El nombre es obligatorio</span>
            }
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <select [(ngModel)]="form.estado" name="estado">
                <option value="ACTIVO">Activo</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha de Fin</label>
              <input type="date" [(ngModel)]="form.fecha_fin" name="fecha_fin" />
            </div>
          </div>
          <div class="form-group">
            <label>Cliente (opcional)</label>
            <select [(ngModel)]="form.id_cliente" name="id_cliente">
              <option [value]="null">Sin cliente</option>
              @for (cliente of clientes; track cliente.id) {
                <option [value]="cliente.id">{{ cliente.nombre }}</option>
              }
            </select>
          </div>
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          @if (editando) {
            <button type="button" class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
          }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; flex-wrap: wrap; gap: 15px; }
    .filter-row .form-group { flex: 1; min-width: 180px; }
    .filter-actions { display: flex; gap: 10px; margin-top: 10px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .ACTIVO { background: #d4edda; color: #155724; }
    .FINALIZADO { background: #cce5ff; color: #004085; }
    .BAJA { background: #f8d7da; color: #721c24; }
    .a-tiempo { background: #d4edda; color: #155724; }
    .proximo { background: #fff3cd; color: #856404; }
    .retrasado { background: #f8d7da; color: #721c24; }
    button { margin-right: 5px; }
    .form-row { display: flex; gap: 15px; }
    .form-row .form-group { flex: 1; }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
    }
    .input-error { border-color: #dc3545 !important; }
    .error-msg { color: #dc3545; font-size: 12px; margin-top: 4px; display: block; }
  `]
})
export class ProyectosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tareasService = inject(TareasService);
  private proyectosService = inject(ProyectosService);
  private clientesService = inject(ClientesService);

  proyectoId!: number;
  proyecto: any = null;
  tareas: any[] = [];
  proyectos: any[] = [];
  clientes: any[] = [];
  editando = false;
  editId: number | null = null;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;
  submitted = false; // NUEVO

  filters = {
    nombre: '',
    estado: '',
    id_cliente: '',
    sort: 'id',
    order: 'ASC',
    page: 1,
    limit: 10
  };

  filterFields = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: '', label: 'Todos' },
      { value: 'ACTIVO', label: 'Activo' },
      { value: 'FINALIZADO', label: 'Finalizado' },
      { value: 'BAJA', label: 'Baja' },
    ]},
    { key: 'id_cliente', label: 'Cliente', type: 'client' },
    { key: 'sort', label: 'Ordenar por', type: 'select', options: [
      { value: 'id', label: 'ID' },
      { value: 'nombre', label: 'Nombre' },
      { value: 'estado', label: 'Estado' },
      { value: 'fecha_fin', label: 'Fecha Fin' },
    ]},
  ];

  form: any = {
    nombre: '',
    estado: 'ACTIVO',
    id_cliente: null,
    fecha_fin: ''
  };

  ngOnInit() {
    this.cargarClientes();
    this.buscar();
  }

  cargar() {
    const params: any = {
      nombre: this.filters.nombre,
      estado: this.filters.estado,
      id_cliente: this.filters.id_cliente || undefined,
      sort: this.filters.sort,
      order: this.filters.order,
      page: this.filters.page,
      limit: this.filters.limit,
    };

    this.proyectosService.getAll(params).subscribe(result => {
      this.proyectos = result.data;
      this.total = result.total;
      this.page = result.page;
      this.limit = result.limit;
      this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
    });
  }

  buscar() {
    this.filters.page = 1;
    this.cargar();
  }

  resetFilters() {
    this.filters = {
      nombre: '',
      estado: '',
      id_cliente: '',
      sort: 'id',
      order: 'ASC',
      page: 1,
      limit: 10
    };
    this.cargar();
  }

  changePage(delta: number) {
    const nextPage = this.page + delta;
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.filters.page = nextPage;
    this.cargar();
  }

  cargarClientes() {
    this.clientesService.getActivos().subscribe(data => this.clientes = data);
  }

  guardar() {
    this.submitted = true;

    if (!this.form.nombre || this.form.nombre.trim() === '') {
      return;
    }

    this.submitted = false;
    const data: any = { ...this.form };
    if (!data.fecha_fin) data.fecha_fin = null;

    if (this.editando && this.editId !== null) {
      this.proyectosService.update(this.editId, data).subscribe({
        next: () => { this.buscar(); this.limpiar(); },
        error: (err) => {
          const msg = Array.isArray(err.error?.message)
            ? err.error.message.join('\n')
            : err.error?.message ?? 'Error al actualizar el proyecto';
          alert(msg);
        }
      });
    } else {
      this.proyectosService.create(data).subscribe({
        next: () => { this.buscar(); this.limpiar(); },
        error: (err) => {
          const msg = Array.isArray(err.error?.message)
            ? err.error.message.join('\n')
            : err.error?.message ?? 'Error al crear el proyecto';
          alert(msg);
        }
      });
    }
  }

  editar(proyecto: any) {
    this.editando = true;
    this.editId = proyecto.id;
    this.form = {
      nombre: proyecto.nombre,
      estado: proyecto.estado,
      id_cliente: proyecto.id_cliente,
      fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split('T')[0] : ''
    };
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar?')) {
      this.proyectosService.delete(id).subscribe(() => this.buscar());
    }
  }

  cancelar() {
    this.limpiar();
  }

  private limpiar() {
    this.submitted = false; // NUEVO
    this.editando = false;
    this.editId = null;
    this.form = { nombre: '', estado: 'ACTIVO', id_cliente: null, fecha_fin: '' };
  }

  getSituacion(proyecto: any): { clase: string; texto: string } {
    if (!proyecto.fecha_fin) return { clase: '', texto: '' };
    const hoy = new Date();
    const fechaFin = new Date(proyecto.fecha_fin);
    const diff = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { clase: 'retrasado', texto: 'Retrasado' };
    if (diff <= 7) return { clase: 'proximo', texto: 'Próximo a vencer' };
    return { clase: 'a-tiempo', texto: 'A tiempo' };
  }
}
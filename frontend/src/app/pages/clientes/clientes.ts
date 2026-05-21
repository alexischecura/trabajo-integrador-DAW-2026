import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../services/clientes.service';
import { FilterPanelComponent } from '../../shared/filter-panel';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, CommonModule, FilterPanelComponent],
  template: `
    <div class="container">
      <h1>Clientes</h1>
      
      <div class="card">
        <h2>{{ editando ? 'Editar' : 'Nuevo' }} Cliente</h2>
        <form (ngSubmit)="guardar()">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="form.nombre" name="nombre" required />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select [(ngModel)]="form.estado" name="estado">
              <option value="ACTIVO">Activo</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          @if (editando) {
            <button type="button" class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
          }
        </form>
      </div>

      <app-filter-panel
        [title]="'Búsqueda de clientes'"
        [filters]="filters"
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (cliente of clientes; track cliente.id) {
              <tr>
                <td>{{ cliente.id }}</td>
                <td>{{ cliente.nombre }}</td>
                <td><span class="badge" [class]="cliente.estado">{{ cliente.estado }}</span></td>
                <td>
                  <button class="btn btn-primary" (click)="editar(cliente)">Editar</button>
                  <button class="btn btn-danger" (click)="eliminar(cliente.id)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 20px;
    }
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .filter-row .form-group {
      flex: 1;
      min-width: 180px;
    }
    .filter-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .ACTIVO { background: #d4edda; color: #155724; }
    .BAJA { background: #f8d7da; color: #721c24; }
    button { margin-right: 5px; }
  `]
})
export class ClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);

  clientes: any[] = [];
  editando = false;
  editId: number | null = null;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  filters = {
    nombre: '',
    estado: '',
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
      { value: 'BAJA', label: 'Baja' },
    ] },
    { key: 'sort', label: 'Ordenar por', type: 'select', options: [
      { value: 'id', label: 'ID' },
      { value: 'nombre', label: 'Nombre' },
      { value: 'estado', label: 'Estado' },
    ] },
  ];

  form = {
    nombre: '',
    estado: 'ACTIVO'
  };

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.filters.page = 1;
    this.cargar();
  }

  cargar() {
    const params = {
      nombre: this.filters.nombre,
      estado: this.filters.estado,
      sort: this.filters.sort,
      order: this.filters.order,
      page: this.filters.page,
      limit: this.filters.limit,
    };

    this.clientesService.getAll(params).subscribe(result => {
      this.clientes = result.data;
      this.total = result.total;
      this.page = result.page;
      this.limit = result.limit;
      this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
    });
  }

  resetFilters() {
    this.filters = {
      nombre: '',
      estado: '',
      sort: 'id',
      order: 'ASC',
      page: 1,
      limit: 10
    };
    this.cargar();
  }

  changePage(delta: number) {
    const nextPage = this.page + delta;
    if (nextPage < 1 || nextPage > this.totalPages) {
      return;
    }
    this.filters.page = nextPage;
    this.cargar();
  }

  guardar() {
    if (this.editando && this.editId !== null) {
      this.clientesService.update(this.editId, this.form).subscribe(() => {
        this.buscar();
        this.limpiar();
      });
    } else {
      this.clientesService.create(this.form).subscribe(() => {
        this.buscar();
        this.limpiar();
      });
    }
  }

  editar(cliente: any) {
    this.editando = true;
    this.editId = cliente.id;
    this.form = { nombre: cliente.nombre, estado: cliente.estado };
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar?')) {
      this.clientesService.delete(id).subscribe({
        next: () => this.buscar(),
        error: () => alert('No se puede eliminar: tiene proyectos asociados')
      });
    }
  }

  cancelar() {
    this.limpiar();
  }

  private limpiar() {
    this.editando = false;
    this.editId = null;
    this.form = { nombre: '', estado: 'ACTIVO' };
  }
}
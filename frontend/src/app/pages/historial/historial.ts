import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../services/historial.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Historial de cambios</h1>

      <div class="card filter-card">
        <div class="form-row">
          <div class="form-group">
            <label>Entidad</label>
            <select [(ngModel)]="entidadFiltro" name="entidadFiltro">
              <option value="">Todas</option>
              <option value="clientes">Clientes</option>
              <option value="proyectos">Proyectos</option>
              <option value="tareas">Tareas</option>
              <option value="usuarios">Usuarios</option>
            </select>
          </div>
          <div class="form-group actions">
            <button class="btn btn-primary" type="button" (click)="buscar()">Filtrar</button>
            <button class="btn btn-secondary" type="button" (click)="reset()">Limpiar</button>
          </div>
        </div>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Usuario</th>
              <th>Entidad</th>
              <th>ID</th>
              <th>Acción</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let registro of registros; trackBy: trackById">
              <td>{{ registro.created_at | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>{{ registro.usuario_nombre }}</td>
              <td>{{ registro.entidad }}</td>
              <td>{{ registro.entidad_id }}</td>
              <td>{{ registro.accion }}</td>
              <td><pre>{{ formatCambios(registro.cambios) }}</pre></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .filter-card {
        margin-bottom: 20px;
      }
      .form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
      .form-group {
        flex: 1;
        min-width: 180px;
      }
      .actions {
        display: flex;
        gap: 10px;
        align-items: flex-end;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }
      th {
        background: #f7f7f7;
      }
    `
  ]
})
export class HistorialComponent implements OnInit {
  private historialService = inject(HistorialService);

  entidadFiltro = '';
  registros: any[] = [];

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.historialService.getAll(this.entidadFiltro).subscribe(data => {
      this.registros = data;
    });
  }

  reset() {
    this.entidadFiltro = '';
    this.buscar();
  }

  formatCambios(cambios: any): string {
    if (!cambios || Object.keys(cambios).length === 0) {
      return 'Sin detalles adicionales';
    }

    if (typeof cambios !== 'object') {
      return String(cambios);
    }

    if (cambios.nuevo) {
      const summary = this.formatObjectSummary(cambios.nuevo);
      return `Registro creado\n${summary}`;
    }

    if (cambios.cambios && typeof cambios.cambios === 'object') {
      const entries = Object.entries(cambios.cambios)
        .filter(([, item]) => item !== null && item !== undefined)
        .map(([field, change]: [string, any]) => {
          if (change.antes !== undefined && change.después !== undefined) {
            return `${field}: ${change.antes} → ${change.después}`;
          }
          return `${field}: ${change}`;
        });

      if (entries.length === 0) {
        return 'Campos modificados: No se detectaron cambios visibles';
      }
      return `Campos modificados:\n${entries.map(line => `  • ${line}`).join('\n')}`;
    }

    const lines = this.formatEntries(cambios);
    return lines.length > 0
      ? `Detalle:\n${lines.map(line => `  • ${line}`).join('\n')}`
      : 'Sin detalles adicionales';
  }

  private formatEntries(value: any, prefix = ''): string[] {
    if (value === null || value === undefined) {
      return [`${prefix}nulo`];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item, index) => this.formatEntries(item, `${prefix}[${index}] `));
    }

    if (typeof value === 'object') {
      return Object.entries(value).flatMap(([key, item]) => {
        const label = prefix ? `${prefix}${key}` : key;
        if (item === null || item === undefined || typeof item !== 'object') {
          return [`${label}: ${item === null ? 'nulo' : item}`];
        }
        return this.formatEntries(item, `${label}.`);
      });
    }

    return [`${prefix}${value}`];
  }

  private formatObjectSummary(value: any): string {
    if (!value || typeof value !== 'object') {
      return String(value);
    }

    const entries = Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined)
      .slice(0, 5)
      .map(([key, item]) => `${key}: ${typeof item === 'object' ? JSON.stringify(item) : item}`);

    return entries.length > 0 ? entries.map(line => `  • ${line}`).join('\n') : '  • Sin datos';
  }

  trackById(index: number, item: any) {
    return item.id ?? index;
  }
}

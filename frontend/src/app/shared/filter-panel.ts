import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card filter-card">
      <h2>{{ title }}</h2>
      <div class="filter-row">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" [(ngModel)]="filters.nombre" name="nombreFilter" />
        </div>

        <div class="form-group">
          <label>Estado</label>
          <select [(ngModel)]="filters.estado" name="estadoFilter">
            <option *ngFor="let option of statusOptions" [value]="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="form-group" *ngIf="showClientFilter">
          <label>Cliente</label>
          <select [(ngModel)]="filters.id_cliente" name="clienteFilter">
            <option [value]="''">Todos</option>
            <option *ngFor="let cliente of clientOptions" [value]="cliente.id">{{ cliente.nombre }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ordenar por</label>
          <select [(ngModel)]="filters.sort" name="sortFilter">
            <option *ngFor="let option of sortOptions" [value]="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Dirección</label>
          <select [(ngModel)]="filters.order" name="orderFilter">
            <option value="ASC">Ascendente</option>
            <option value="DESC">Descendente</option>
          </select>
        </div>
      </div>

      <div class="filter-actions">
        <button type="button" class="btn btn-primary" (click)="search.emit()">Buscar</button>
        <button type="button" class="btn btn-secondary" (click)="reset.emit()">Limpiar</button>
      </div>
    </div>
  `,
  styles: [
    `
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
      button { margin-right: 5px; }
    `
  ]
})
export class FilterPanelComponent {
  @Input() title = 'Búsqueda avanzada';
  @Input() filters: any = {};
  @Input() showClientFilter = false;
  @Input() clientOptions: any[] = [];
  @Input() statusOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'BAJA', label: 'Baja' },
  ];
  @Input() sortOptions: Array<{ value: string; label: string }> = [
    { value: 'id', label: 'ID' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'estado', label: 'Estado' },
    { value: 'fecha_fin', label: 'Fecha Fin' },
  ];

  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}

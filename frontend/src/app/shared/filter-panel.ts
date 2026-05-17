import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'client';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card filter-card">
      <h2>{{ title }}</h2>
      <div class="filter-row">
        <ng-container *ngFor="let field of fields">
          <div class="form-group" *ngIf="field.type !== 'client' || showClientFilter">
            <label>{{ field.label }}</label>
            <ng-container [ngSwitch]="field.type">
              <input *ngSwitchCase="'text'" type="text" [(ngModel)]="filters[field.key]" [name]="field.key" [placeholder]="field.placeholder || ''" />
              <select *ngSwitchCase="'select'" [(ngModel)]="filters[field.key]" [name]="field.key">
                <option *ngFor="let option of field.options" [value]="option.value">{{ option.label }}</option>
              </select>
              <select *ngSwitchCase="'client'" [(ngModel)]="filters[field.key]" [name]="field.key">
                <option [value]="''">Todos</option>
                <option *ngFor="let cliente of clientOptions" [value]="cliente.id">{{ cliente.nombre }}</option>
              </select>
            </ng-container>
          </div>
        </ng-container>

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
  @Input() fields: FilterField[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: '', label: 'Todos' },
      { value: 'ACTIVO', label: 'Activo' },
      { value: 'FINALIZADO', label: 'Finalizado' },
      { value: 'BAJA', label: 'Baja' },
    ] },
    { key: 'id_cliente', label: 'Cliente', type: 'client' },
    { key: 'sort', label: 'Ordenar por', type: 'select', options: [
      { value: 'id', label: 'ID' },
      { value: 'nombre', label: 'Nombre' },
      { value: 'estado', label: 'Estado' },
      { value: 'fecha_fin', label: 'Fecha Fin' },
    ] },
  ];

  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}

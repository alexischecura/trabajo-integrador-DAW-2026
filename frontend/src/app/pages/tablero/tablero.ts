import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TareasService } from '../../services/tareas.service';
import { ProyectosService } from '../../services/proyectos.service';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablero',
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup, FormsModule],
  template: `
    <div class="container">
      <button class="btn btn-secondary" (click)="volver()">← Volver a Proyectos</button>
      <h1>Tareas del Proyecto</h1>

      @if (proyecto) {
        <p><strong>Proyecto:</strong> {{ proyecto.nombre }}</p>
      }
      <div class="tablero" cdkDropListGroup>
        <div class="column pendiente">
          <h2>Pendientes</h2>
          <div
            class="tasks"
            cdkDropList
            (cdkDropListDropped)="drop($event, 'PENDIENTE')"
            [cdkDropListData]="this.columnas.PENDIENTE"
          >
            <div class="task" cdkDrag *ngFor="let tarea of columnas.PENDIENTE">
              <p>{{ tarea.descripcion }}</p>
              <div class="btns">
                <button class="btn-editar" (click)="editar(tarea.id)">Editar</button>
                <button class="btn-eliminar" (click)="eliminar(tarea.id)">Eliminar</button>
              </div>
            </div>
          </div>
          <div class="form-container">
            <form (ngSubmit)="guardar()" class="form-tarea">
              <textarea
                [(ngModel)]="form.descripcion"
                name="descripcion"
                rows="3"
                required
                placeholder="Agregar nueva tarea..."
                class="tarea-input"
              >
              </textarea>
              <button type="submit" class="btn btn-primary">Agregar</button>
            </form>
          </div>
        </div>

        <div class="column finalizada">
          <h2>Finalizadas</h2>
          <div
            class="tasks"
            cdkDropList
            (cdkDropListDropped)="drop($event, 'FINALIZADA')"
            [cdkDropListData]="this.columnas.FINALIZADA"
          >
            <div class="task" cdkDrag *ngFor="let tarea of columnas.FINALIZADA">
              <p>{{ tarea.descripcion }}</p>
              <div class="btns">
                <button class="btn-editar" (click)="editar(tarea.id)">Editar</button>
                <button class="btn-eliminar" (click)="eliminar(tarea.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="column baja">
          <h2>Baja</h2>
          <div
            class="tasks"
            cdkDropList
            (cdkDropListDropped)="drop($event, 'BAJA')"
            [cdkDropListData]="this.columnas.BAJA"
          >
            <div class="task" cdkDrag *ngFor="let tarea of columnas.BAJA">
              <p>{{ tarea.descripcion }}</p>
              <div class="btns">
                <button class="btn-editar" (click)="editar(tarea.id)">Editar</button>
                <button class="btn-eliminar" (click)="eliminar(tarea.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tablero {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .column {
        border-radius: 12px;
        padding: 1rem;
        height: 70vh;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        display: flex;
        flex-direction: column;

        overflow: hidden;
      }

      .tasks {
        flex: 1;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        min-height: 0;
      }

      .task {
        padding: 0.5rem;
        border-radius: 8px;
        height: 100px;
        width: 100%;

        flex-shrink: 0;
      }

      .form-container {
        margin-top: 1rem;
        flex-shrink: 0;

        background: white;
      }

      .pendiente .task {
        background: #fff3cd;
      }

      .finalizada .task {
        background: #d4edda;
      }

      .baja .task {
        background: #f8d7da;
      }

      .cdk-drag-placeholder {
        opacity: 0;
      }

      .cdk-drag-preview {
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        background-color: #fff;
      }
      .btns {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .btn-eliminar {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background-color: #dc3545;
        color: white;
        padding-left: auto;
      }

      .btn-editar {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background-color: #007bff;
        color: white;
        padding-left: auto;
      }

      .form-tarea {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        align-items: stretch;
      }

      .tarea-input {
        flex: 1;
        height: 60px;
        resize: none;

        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        font-family: inherit;
      }

      .form-tarea button {
        flex-shrink: 0;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class TableroComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tareasService = inject(TareasService);
  private proyectosService = inject(ProyectosService);

  proyectoId!: number;
  proyecto: any = null;
  tareas: any[] = [];
  columnas = {
    PENDIENTE: [] as any[],
    FINALIZADA: [] as any[],
    BAJA: [] as any[],
  };

  form = {
    descripcion: '',
    estado: 'PENDIENTE',
  };

  ngOnInit() {
    this.proyectoId = +this.route.snapshot.params['proyectoId'];
    this.cargarProyecto();
    this.cargarTareas();
  }

  cargarProyecto() {
    this.proyectosService.getById(this.proyectoId).subscribe((data) => (this.proyecto = data));
  }

  cargarTareas() {
    this.tareasService.getByProyecto(this.proyectoId).subscribe((data) => {
      this.tareas = data;
      this.agruparTareas();
    });
  }

  agruparTareas() {
    this.columnas.PENDIENTE = this.tareas.filter((t) => t.estado === 'PENDIENTE');
    this.columnas.FINALIZADA = this.tareas.filter((t) => t.estado === 'FINALIZADA');
    this.columnas.BAJA = this.tareas.filter((t) => t.estado === 'BAJA');
  }

  drop(event: CdkDragDrop<any[]>, columnaDestino: string) {
    const { previousContainer, container, previousIndex, currentIndex } = event;

    if (previousContainer === container) {
      moveItemInArray(container.data, previousIndex, currentIndex);
    } else {
      transferArrayItem(previousContainer.data, container.data, previousIndex, currentIndex);

      const tarea = container.data[currentIndex];

      this.tareasService
        .update(tarea.id, {
          estado: columnaDestino,
        })
        .subscribe({
          next: () => {
            console.log('Estado actualizado');
          },
          error: (err) => {
            console.error(err);
          },
        });
    }
  }
  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar?')) {
      this.tareasService.delete(id).subscribe(() => this.cargarTareas());
    }
  }

  editar(id: number) {
    const tarea = this.tareas.find((t) => t.id === id);
    if (tarea) {
      const nuevaDescripcion = prompt('Editar descripción', tarea.descripcion);
      if (nuevaDescripcion !== null && nuevaDescripcion.trim() !== '') {
        this.tareasService.update(id, { descripcion: nuevaDescripcion }).subscribe(() => {
          this.cargarTareas();
        });
      }
    }
  }

  guardar() {
    if (!this.form.descripcion.trim()) {
      return;
    }
    this.tareasService.create({ ...this.form, id_proyecto: this.proyectoId }).subscribe(() => {
      this.cargarTareas();
      this.form.descripcion = '';
    });
  }

  volver() {
    this.router.navigate(['/layout/proyectos']);
  }
}

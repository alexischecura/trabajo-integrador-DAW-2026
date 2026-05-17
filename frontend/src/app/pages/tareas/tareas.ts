import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TareasService } from '../../services/tareas.service';
import { ProyectosService } from '../../services/proyectos.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
      <button class="btn btn-secondary" (click)="volver()">← Volver a Proyectos</button>
      <h1>Tareas del Proyecto</h1>
      
      @if (proyecto) {
        <p><strong>Proyecto:</strong> {{ proyecto.nombre }}</p>
      }

      <div class="card">
        <h2>{{ editando ? 'Editar' : 'Nueva' }} Tarea</h2>
        <form (ngSubmit)="guardar()">
          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="form.descripcion" name="descripcion" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select [(ngModel)]="form.estado" name="estado">
              <option value="PENDIENTE">Pendiente</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          @if (editando) {
            <button type="button" class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
          }
        </form>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (tarea of tareas; track tarea.id) {
              <tr>
                <td>{{ tarea.id }}</td>
                <td>{{ tarea.descripcion }}</td>
                <td><span class="badge" [class]="tarea.estado">{{ tarea.estado }}</span></td>
                <td>
                  <button class="btn btn-primary" (click)="editar(tarea)">Editar</button>
                  <button class="btn btn-danger" (click)="eliminar(tarea.id)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .PENDIENTE { background: #fff3cd; color: #856404; }
    .FINALIZADA { background: #d4edda; color: #155724; }
    .BAJA { background: #f8d7da; color: #721c24; }
    button { margin-right: 5px; }
    textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class TareasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tareasService = inject(TareasService);
  private proyectosService = inject(ProyectosService);

  proyectoId!: number;
  proyecto: any = null;
  tareas: any[] = [];
  editando = false;
  editId: number | null = null;
  
  form = {
    descripcion: '',
    estado: 'PENDIENTE'
  };

  ngOnInit() {
    this.proyectoId = +this.route.snapshot.params['proyectoId'];
    this.cargarProyecto();
    this.cargar();
  }

  cargarProyecto() {
    this.proyectosService.getById(this.proyectoId).subscribe(data => this.proyecto = data);
  }

  cargar() {
    this.tareasService.getByProyecto(this.proyectoId).subscribe(data => this.tareas = data);
  }

  guardar() {
    if (this.editando && this.editId !== null) {
      this.tareasService.update(this.editId, this.form).subscribe(() => {
        this.cargar();
        this.limpiar();
      });
    } else {
      this.tareasService.create({ ...this.form, id_proyecto: this.proyectoId }).subscribe(() => {
        this.cargar();
        this.limpiar();
      });
    }
  }

  editar(tarea: any) {
    this.editando = true;
    this.editId = tarea.id;
    this.form = { descripcion: tarea.descripcion, estado: tarea.estado };
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar?')) {
      this.tareasService.delete(id).subscribe(() => this.cargar());
    }
  }

  cancelar() {
    this.limpiar();
  }

  volver() {
    this.router.navigate(['/layout/proyectos']);
  }

  private limpiar() {
    this.editando = false;
    this.editId = null;
    this.form = { descripcion: '', estado: 'PENDIENTE' };
  }
}
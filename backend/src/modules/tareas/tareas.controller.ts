import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { TareasService } from './tareas.service';
import { HistorialService } from '../historial/historial.service';

@Controller('tareas')
export class TareasController {
  constructor(
    private readonly tareasService: TareasService,
    private readonly historialService: HistorialService,
  ) {}

  @Get()
  findAll(@Query('id_proyecto') id_proyecto?: string) {
    if (id_proyecto) {
      return this.tareasService.findByProyecto(+id_proyecto);
    }
    return this.tareasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareasService.findOne(+id);
  }

  @Post()
  async create(
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const tarea = await this.tareasService.create(body);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'tareas',
      entidad_id: tarea.id,
      accion: 'CREAR',
      cambios: { nuevo: tarea },
    });
    return tarea;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const tareaAnterior = await this.tareasService.findOne(+id);
    const tarea = await this.tareasService.update(+id, body);
    
    const cambios = this.calcularCambios(tareaAnterior, tarea);
    
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'tareas',
      entidad_id: +id,
      accion: 'ACTUALIZAR',
      cambios: { cambios },
    });
    return tarea;
  }

  private calcularCambios(anterior: any, actual: any): Record<string, any> {
    const cambios: Record<string, any> = {};
    
    Object.keys(actual).forEach(key => {
      const valorAnterior = anterior[key];
      const valorActual = actual[key];
      
      if (JSON.stringify(valorAnterior) !== JSON.stringify(valorActual)) {
        cambios[key] = { antes: valorAnterior, después: valorActual };
      }
    });
    
    return cambios;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const result = await this.tareasService.delete(+id);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'tareas',
      entidad_id: +id,
      accion: 'ELIMINAR',
      cambios: {},
    });
    return result;
  }
}
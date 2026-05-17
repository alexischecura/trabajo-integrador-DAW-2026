import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { HistorialService } from '../historial/historial.service';

@Controller('proyectos')
export class ProyectosController {
  constructor(
    private readonly proyectosService: ProyectosService,
    private readonly historialService: HistorialService,
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.proyectosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectosService.findOne(+id);
  }

  @Post()
  async create(
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const proyecto = await this.proyectosService.create(body);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'proyectos',
      entidad_id: proyecto.id,
      accion: 'CREAR',
      cambios: { nuevo: proyecto },
    });
    return proyecto;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const proyectoAnterior = await this.proyectosService.findOne(+id);
    const proyecto = await this.proyectosService.update(+id, body);
    
    const cambios = this.calcularCambios(proyectoAnterior, proyecto);
    
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'proyectos',
      entidad_id: +id,
      accion: 'ACTUALIZAR',
      cambios: { cambios },
    });
    return proyecto;
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
    const result = await this.proyectosService.delete(+id);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'proyectos',
      entidad_id: +id,
      accion: 'ELIMINAR',
      cambios: {},
    });
    return result;
  }
}
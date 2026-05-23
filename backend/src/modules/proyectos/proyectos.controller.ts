import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { HistorialService } from '../historial/historial.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

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
    @Body() body: CreateProyectoDto,
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
    @Body() body: UpdateProyectoDto,
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
      if (JSON.stringify(anterior[key]) !== JSON.stringify(actual[key])) {
        cambios[key] = { antes: anterior[key], después: actual[key] };
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
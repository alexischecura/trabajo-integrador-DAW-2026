import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { HistorialService } from '../historial/historial.service';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly historialService: HistorialService,
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.clientesService.findAll(query);
  }

  @Get('activos')
  findActivos() {
    return this.clientesService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Post()
  async create(
    @Body() body: { nombre: string },
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const cliente = await this.clientesService.create(body);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'clientes',
      entidad_id: cliente.id,
      accion: 'CREAR',
      cambios: { nuevo: cliente },
    });
    return cliente;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const clienteAnterior = await this.clientesService.findOne(+id);
    const cliente = await this.clientesService.update(+id, body);
    
    const cambios = this.calcularCambios(clienteAnterior, cliente);
    
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'clientes',
      entidad_id: +id,
      accion: 'ACTUALIZAR',
      cambios: { cambios },
    });
    return cliente;
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
    const result = await this.clientesService.delete(+id);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'clientes',
      entidad_id: +id,
      accion: 'ELIMINAR',
      cambios: {},
    });
    return result;
  }
}
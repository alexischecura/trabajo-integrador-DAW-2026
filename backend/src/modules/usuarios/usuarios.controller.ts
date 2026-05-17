import { Controller, Get, Post, Put, Param, Body, Headers } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { HistorialService } from '../historial/historial.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly historialService: HistorialService,
  ) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Post()
  async create(
    @Body() body: { nombre: string; clave: string },
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const usuario = await this.usuariosService.create(body);
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'usuarios',
      entidad_id: usuario.id,
      accion: 'CREAR',
      cambios: { nuevo: usuario },
    });
    return usuario;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
  ) {
    const usuarioAnterior = await this.usuariosService.findOne(+id);
    const usuario = await this.usuariosService.update(+id, body);
    
    const cambios = this.calcularCambios(usuarioAnterior, usuario);
    
    await this.historialService.record({
      usuario_id: Number(userId) || 0,
      usuario_nombre: userName || 'desconocido',
      entidad: 'usuarios',
      entidad_id: +id,
      accion: 'ACTUALIZAR',
      cambios: { cambios },
    });
    return usuario;
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
}
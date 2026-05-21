import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { EstadoUsuario } from './entities/estado-usuario.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  findAll() {
    return this.usuarioRepository.find({
      select: ['id', 'nombre', 'estado'],
    });
  }

  findOne(id: number) {
    const usuario = this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'estado'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async create(data: { nombre: string; clave: string }) {
    const usuario = this.usuarioRepository.create({
      nombre: data.nombre,
      clave: `crypt('${data.clave}', gen_salt('bf', 10))`,
    });
    return this.usuarioRepository.save(usuario);
  }

  async update(id: number, data: Partial<{ nombre: string; clave: string; estado: EstadoUsuario }>) {
    const usuario = await this.findOne(id);
    Object.assign(usuario, data);
    return this.usuarioRepository.save(usuario);
  }
}
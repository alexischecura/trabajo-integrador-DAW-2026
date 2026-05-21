import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoUsuario } from '../usuarios/entities/estado-usuario.enum';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async login(loginDto: LoginDto) {
    const { nombre, clave } = loginDto;
    
    const result = await this.usuarioRepository.query(
      `SELECT id, nombre FROM usuarios 
       WHERE nombre = $1 
       AND clave = crypt($2, clave)
       AND estado = $3`,
      [nombre, clave, EstadoUsuario.ACTIVO]
    );

    if (result.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      id: result[0].id,
      nombre: result[0].nombre,
    };
  }
}
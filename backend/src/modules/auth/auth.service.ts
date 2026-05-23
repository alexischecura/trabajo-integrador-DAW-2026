import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoUsuario } from '../usuarios/entities/estado-usuario.enum';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';

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

    const token = randomUUID();
    await this.usuarioRepository.update(result[0].id, { sessionToken: token });

    return {
      id: result[0].id,
      nombre: result[0].nombre,
      token,
    };
  }

  async logout(token: string) {
    await this.usuarioRepository.update(
      { sessionToken: token },
      { sessionToken: null },
    );
  }

  async validarToken(token: string): Promise<Usuario | null> {
    if (!token) return null;
    const usuario = await this.usuarioRepository.findOne({
      where: { sessionToken: token, estado: EstadoUsuario.ACTIVO },
    });
    return usuario ?? null;
  }
}
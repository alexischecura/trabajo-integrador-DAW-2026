import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EstadoUsuario } from './estado-usuario.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  estado: EstadoUsuario;

  @Column({ nullable: true, name: 'session_token' })
  sessionToken: string;

}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
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
}
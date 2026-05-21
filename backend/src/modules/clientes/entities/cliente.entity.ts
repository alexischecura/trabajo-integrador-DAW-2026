import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EstadoCliente } from './estado-cliente.enum';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'enum', enum: EstadoCliente, default: EstadoCliente.ACTIVO })
  estado: EstadoCliente;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.cliente)
  proyectos: Proyecto[];
}
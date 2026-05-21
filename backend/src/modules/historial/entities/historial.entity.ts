import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('historial')
export class Historial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @Column()
  usuario_nombre: string;

  @Column()
  entidad: string;

  @Column()
  entidad_id: number;

  @Column()
  accion: string;

  @Column({ type: 'jsonb', nullable: true })
  cambios: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

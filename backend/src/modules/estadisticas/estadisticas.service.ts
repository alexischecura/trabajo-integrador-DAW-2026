import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { Tarea } from '../tareas/entities/tarea.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Tarea)
    private tareaRepository: Repository<Tarea>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async getEstadisticas() {
    const proyectosPorEstado = await this.proyectoRepository
      .createQueryBuilder('p')
      .select('p.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('p.estado')
      .getRawMany();

    const proyectosPorCliente = await this.proyectoRepository
      .createQueryBuilder('p')
      .innerJoin('p.cliente', 'c')
      .select('c.nombre', 'cliente')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('c.nombre')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const tareasPorEstado = await this.tareaRepository
      .createQueryBuilder('t')
      .select('t.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('t.estado')
      .getRawMany();

    // Proyectos activos retrasados (fecha_fin pasada y estado ACTIVO)
    const hoy = new Date();
    const proyectosRetrasados = await this.proyectoRepository
      .createQueryBuilder('p')
      .where('p.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('p.fecha_fin < :hoy', { hoy })
      .getCount();

    const clientesSinProyectos = await this.clienteRepository
      .createQueryBuilder('c')
      .leftJoin('c.proyectos', 'p')
      .where('c.estado = :estado', { estado: 'ACTIVO' })
      .groupBy('c.id')
      .having('COUNT(p.id) = 0')
      .getCount();

    return {
      proyectosPorEstado,
      proyectosPorCliente,
      tareasPorEstado,
      proyectosRetrasados,
      clientesSinProyectos,
    };
  }
}
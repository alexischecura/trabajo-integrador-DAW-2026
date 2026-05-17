import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { EstadoProyecto } from './entities/estado-proyecto.enum';
import { Cliente } from '../clientes/entities/cliente.entity';
import { EstadoCliente } from '../clientes/entities/estado-cliente.enum';
import { Tarea } from '../tareas/entities/tarea.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Tarea)
    private tareaRepository: Repository<Tarea>,
  ) {}

  async findAll(query?: { nombre?: string; estado?: string; id_cliente?: number; sort?: string; order?: 'ASC' | 'DESC'; page?: number; limit?: number }) {
    const qb = this.proyectoRepository.createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.cliente', 'cliente');

    if (query?.nombre) {
      qb.where('proyecto.nombre ILIKE :nombre', { nombre: `%${query.nombre}%` });
    }

    if (query?.estado) {
      qb.andWhere('proyecto.estado = :estado', { estado: query.estado });
    }

    const idCliente = query?.id_cliente !== undefined && query?.id_cliente !== null
      ? Number(query.id_cliente)
      : undefined;
    if (idCliente !== undefined && !Number.isNaN(idCliente)) {
      qb.andWhere('proyecto.id_cliente = :id_cliente', { id_cliente: idCliente });
    }

    const validSortFields = ['id', 'nombre', 'estado', 'fecha_fin'];
    const sort = validSortFields.includes(query?.sort) ? query.sort : 'id';
    const order = query?.order === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(`proyecto.${sort}`, order);

    const page = Number(query?.page) >= 1 ? Number(query.page) : 1;
    const limit = Number(query?.limit) >= 1 ? Math.min(Number(query.limit), 50) : 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id },
      relations: ['cliente', 'tareas'],
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }
    return proyecto;
  }

  async create(data: { nombre: string; estado?: EstadoProyecto; id_cliente?: number | null; fecha_fin?: string | null }) {
    if (data.id_cliente) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: data.id_cliente, estado: EstadoCliente.ACTIVO },
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado o no está activo');
      }
    }
    
    const proyecto = this.proyectoRepository.create({
      nombre: data.nombre,
      estado: data.estado || EstadoProyecto.ACTIVO,
      id_cliente: data.id_cliente || null,
      fecha_fin: data.fecha_fin || null,
    });
    return this.proyectoRepository.save(proyecto);
  }

  async update(id: number, data: { nombre?: string; estado?: EstadoProyecto; id_cliente?: number | null; fecha_fin?: string | null }) {
    const proyecto = await this.findOne(id);
    
    if (data.id_cliente !== undefined && data.id_cliente !== null) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: data.id_cliente, estado: EstadoCliente.ACTIVO },
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado o no está activo');
      }
    }
    
    if (data.fecha_fin !== undefined) {
      proyecto.fecha_fin = data.fecha_fin ? new Date(data.fecha_fin) : null;
    }
    
    proyecto.nombre = data.nombre ?? proyecto.nombre;
    proyecto.estado = data.estado ?? proyecto.estado;
    proyecto.id_cliente = data.id_cliente !== undefined ? data.id_cliente : proyecto.id_cliente;
    
    return this.proyectoRepository.save(proyecto);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.tareaRepository.delete({ id_proyecto: id });
    await this.proyectoRepository.delete(id);
    return { message: 'Proyecto eliminado' };
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { EstadoCliente } from './entities/estado-cliente.enum';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(query?: { nombre?: string; estado?: string; sort?: string; order?: 'ASC' | 'DESC'; page?: number; limit?: number }) {
    const qb = this.clienteRepository.createQueryBuilder('cliente');

    if (query?.nombre) {
      qb.where('cliente.nombre ILIKE :nombre', { nombre: `%${query.nombre}%` });
    }

    if (query?.estado) {
      qb.andWhere('cliente.estado = :estado', { estado: query.estado });
    }

    const validSortFields = ['id', 'nombre', 'estado'];
    const sort = validSortFields.includes(query?.sort) ? query.sort : 'id';
    const order = query?.order === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(`cliente.${sort}`, order);

    const page = Number(query?.page) >= 1 ? Number(query.page) : 1;
    const limit = Number(query?.limit) >= 1 ? Math.min(Number(query.limit), 50) : 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async findActivos() {
    return this.clienteRepository.find({
      where: { estado: EstadoCliente.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }

  create(data: { nombre: string }) {
    const cliente = this.clienteRepository.create(data);
    return this.clienteRepository.save(cliente);
  }

  async update(id: number, data: Partial<{ nombre: string; estado: EstadoCliente }>) {
    const cliente = await this.findOne(id);
    Object.assign(cliente, data);
    return this.clienteRepository.save(cliente);
  }

  async canDelete(id: number): Promise<boolean> {
    const proyectos = await this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoin('cliente.proyectos', 'proyecto')
      .where('cliente.id = :id', { id })
      .andWhere('proyecto.id IS NOT NULL')
      .getOne();
    
    return proyectos === null;
  }

  async delete(id: number) {
    const canDelete = await this.canDelete(id);
    if (!canDelete) {
      throw new BadRequestException('No se puede eliminar cliente con proyectos asociados');
    }
    await this.clienteRepository.delete(id);
    return { message: 'Cliente eliminado' };
  }
}
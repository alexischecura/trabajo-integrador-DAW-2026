import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { EstadoTarea } from './entities/estado-tarea.enum';
import { Proyecto } from '../proyectos/entities/proyecto.entity';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private tareaRepository: Repository<Tarea>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
  ) {}

  findAll() {
    return this.tareaRepository.find({
      relations: ['proyecto'],
      order: { id: 'ASC' },
    });
  }

  findByProyecto(id_proyecto: number) {
    return this.tareaRepository.find({
      where: { id_proyecto },
      order: { id: 'ASC' },
    });
  }

  findOne(id: number) {
    const tarea = this.tareaRepository.findOne({
      where: { id },
      relations: ['proyecto'],
    });
    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return tarea;
  }

  async create(data: { descripcion: string; estado?: EstadoTarea; id_proyecto: number }) {
    const proyecto = await this.proyectoRepository.findOne({ where: { id: data.id_proyecto } });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const tarea = this.tareaRepository.create({
      descripcion: data.descripcion,
      estado: data.estado || EstadoTarea.PENDIENTE,
      id_proyecto: data.id_proyecto,
    });
    return this.tareaRepository.save(tarea);
  }

  async update(id: number, data: Partial<{ descripcion: string; estado: EstadoTarea; id_proyecto: number }>) {
    const tarea = await this.findOne(id);
    Object.assign(tarea, data);
    return this.tareaRepository.save(tarea);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.tareaRepository.delete(id);
    return { message: 'Tarea eliminada' };
  }
}
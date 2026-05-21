import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './entities/historial.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private historialRepository: Repository<Historial>,
  ) {}

  record(data: {
    usuario_id: number;
    usuario_nombre: string;
    entidad: string;
    entidad_id: number;
    accion: string;
    cambios?: any;
  }) {
    const registro = this.historialRepository.create(data);
    return this.historialRepository.save(registro);
  }

  findAll(entidad?: string) {
    const query = this.historialRepository.createQueryBuilder('historial')
      .orderBy('historial.created_at', 'DESC');

    if (entidad) {
      query.where('historial.entidad = :entidad', { entidad });
    }

    return query.getMany();
  }
}

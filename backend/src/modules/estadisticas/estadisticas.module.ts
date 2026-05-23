import { Cliente } from '../clientes/entities/cliente.entity';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Module } from '@nestjs/common';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { Tarea } from '../tareas/entities/tarea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, Tarea, Cliente])],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}
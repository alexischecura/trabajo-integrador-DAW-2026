import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';
import { Tarea } from './entities/tarea.entity';
import { Proyecto } from '../proyectos/entities/proyecto.entity';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tarea, Proyecto]), HistorialModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
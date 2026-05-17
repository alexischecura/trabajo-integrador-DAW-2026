import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { Historial } from './entities/historial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Historial])],
  controllers: [HistorialController],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}

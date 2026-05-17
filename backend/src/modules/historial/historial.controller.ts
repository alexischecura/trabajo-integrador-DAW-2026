import { Controller, Get, Query } from '@nestjs/common';
import { HistorialService } from './historial.service';

@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get()
  findAll(@Query('entidad') entidad?: string) {
    return this.historialService.findAll(entidad);
  }
}

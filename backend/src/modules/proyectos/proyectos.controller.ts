import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.proyectosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectosService.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.proyectosService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.proyectosService.update(+id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.proyectosService.delete(+id);
  }
}
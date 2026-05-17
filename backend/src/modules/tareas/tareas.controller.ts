import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { TareasService } from './tareas.service';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Get()
  findAll(@Query('id_proyecto') id_proyecto?: string) {
    if (id_proyecto) {
      return this.tareasService.findByProyecto(+id_proyecto);
    }
    return this.tareasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareasService.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.tareasService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tareasService.update(+id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tareasService.delete(+id);
  }
}
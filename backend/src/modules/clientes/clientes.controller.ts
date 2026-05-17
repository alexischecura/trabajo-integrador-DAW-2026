import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.clientesService.findAll(query);
  }

  @Get('activos')
  findActivos() {
    return this.clientesService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Post()
  create(@Body() body: { nombre: string }) {
    return this.clientesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.clientesService.update(+id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clientesService.delete(+id);
  }
}
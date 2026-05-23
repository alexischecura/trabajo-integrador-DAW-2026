import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { EstadoProyecto } from '../entities/estado-proyecto.enum';
import { Type } from 'class-transformer';

export class CreateProyectoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsOptional()
  @IsEnum(EstadoProyecto, { message: 'Estado inválido' })
  estado?: EstadoProyecto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number | null;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida' })
  fecha_fin?: string | null;
}
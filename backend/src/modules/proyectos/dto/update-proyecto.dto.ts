import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

import { EstadoProyecto } from '../entities/estado-proyecto.enum';

export class UpdateProyectoDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  nombre?: string;

  @IsOptional()
  @IsEnum(EstadoProyecto, { message: 'Estado inválido' })
  estado?: EstadoProyecto;

  @IsOptional()
  @IsInt()
  id_cliente?: number | null;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida' })
  fecha_fin?: string | null;
}
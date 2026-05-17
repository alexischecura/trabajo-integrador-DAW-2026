import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  nombre: string;

  @IsString()
  @MinLength(1)
  clave: string;
}
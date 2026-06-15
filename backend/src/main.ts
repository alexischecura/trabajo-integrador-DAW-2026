import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS historial (
      id SERIAL PRIMARY KEY,
      usuario_id integer NOT NULL,
      usuario_nombre text NOT NULL,
      entidad text NOT NULL,
      entidad_id integer NOT NULL,
      accion text NOT NULL,
      cambios jsonb,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors();
  
  await app.listen(process.env.PORT || 4000);
}

bootstrap();
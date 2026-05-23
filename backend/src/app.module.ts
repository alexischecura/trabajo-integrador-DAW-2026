import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ConfigModule } from '@nestjs/config';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { HistorialModule } from './modules/historial/historial.module';
import { Module } from '@nestjs/common';
import { ProyectosModule } from './modules/proyectos/proyectos.module';
import { TareasModule } from './modules/tareas/tareas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsuariosModule,
    ClientesModule,
    ProyectosModule,
    TareasModule,
    HistorialModule,
    EstadisticasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
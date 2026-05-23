import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'layout',
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'proyectos',
        pathMatch: 'full'
      },
      {
        path: 'proyectos',
        loadComponent: () => import('./pages/proyectos/proyectos').then(m => m.ProyectosComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'tareas/:proyectoId',
        loadComponent: () => import('./pages/tareas/tareas').then(m => m.TareasComponent)
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial').then(m => m.HistorialComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./pages/estadisticas/estadisticas').then(m => m.EstadisticasComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
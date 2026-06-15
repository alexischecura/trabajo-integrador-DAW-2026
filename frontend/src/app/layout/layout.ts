import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthStore } from '../auth/auth-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <h3>Gestión de Proyectos</h3>
        <ul>
          <li>
            <a routerLink="/layout/proyectos" routerLinkActive="active">
              Proyectos
            </a>
          </li>
          <li>
            <a routerLink="/layout/clientes" routerLinkActive="active">
              Clientes
            </a>
          </li>
          <li>
            <a routerLink="/layout/historial" routerLinkActive="active">
              Historial
            </a>
          </li>
                    <li>
       <a routerLink="/layout/estadisticas" routerLinkActive="active">Estadísticas</a>
          </li>
        </ul>
        <div class="user-info">
          <span>{{ authStore.user()?.nombre }}</span>
          <button (click)="logout()">Cerrar sesión</button>
        </div>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .sidebar h3 {
      margin: 0 0 30px 0;
      text-align: center;
    }
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }
    .sidebar li {
      margin-bottom: 10px;
    }
    .sidebar a {
      display: block;
      padding: 12px 15px;
      color: #ecf0f1;
      text-decoration: none;
      border-radius: 5px;
      transition: background 0.3s;
    }
    .sidebar a:hover, .sidebar a.active {
      background: #34495e;
    }
    .user-info {
      border-top: 1px solid #34495e;
      padding-top: 15px;
      text-align: center;
    }
    .user-info span {
      display: block;
      margin-bottom: 10px;
    }
    .user-info button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    .content {
      flex: 1;
      padding: 20px;
      background: #ecf0f1;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {
  authStore = inject(AuthStore);
  private router = inject(Router);

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
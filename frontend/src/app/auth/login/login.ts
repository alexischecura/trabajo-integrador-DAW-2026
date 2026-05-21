import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../auth-store';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Gestión de Proyectos</h2>
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" [(ngModel)]="nombre" name="nombre" required />
          </div>
          <div class="form-group">
            <label>Clave</label>
            <div class="password-wrapper">
              <input [type]="mostrarClave ? 'text' : 'password'" [(ngModel)]="clave" name="clave" required />
              <button type="button" class="toggle-btn" (click)="mostrarClave = !mostrarClave">
                {{ mostrarClave ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>
          @if (error) {
            <div class="error">{{ error }}</div>
          }
          <button type="submit" class="btn btn-primary">Ingresar</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    .error {
      color: #dc3545;
      margin-bottom: 15px;
      text-align: center;
    }
    .password-wrapper {
      position: relative;
      display: flex;
    }
    .password-wrapper input {
      flex: 1;
      padding-right: 50px;
    }
    .toggle-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 12px;
    }
  `]
})
export class LoginComponent {
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  clave = '';
  error = '';
  mostrarClave = false;

  login() {
    this.error = '';
    console.log('Intentando login:', this.nombre, this.clave);
    this.authService.login({ nombre: this.nombre, clave: this.clave }).subscribe({
      next: (user) => {
        console.log('Login exitoso:', user);
        this.authStore.login(user);
        this.router.navigate(['/layout/proyectos']);
      },
      error: (err) => {
        console.log('Login falló:', err);
        this.error = 'Credenciales inválidas';
      }
    });
  }
}
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth-store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated && req.url.includes('/api/')) {
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authStore.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
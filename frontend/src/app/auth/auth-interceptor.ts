import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth-store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();

  if (user) {
    req = req.clone({
      setHeaders: {
        ...req.headers.keys().reduce((acc, key) => ({ ...acc, [key]: req.headers.get(key) ?? '' }), {}),
        'x-user-id': String(user.id),
        'x-user-name': user.nombre,
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
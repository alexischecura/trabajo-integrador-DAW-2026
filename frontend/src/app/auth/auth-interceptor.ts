import { catchError, throwError } from 'rxjs';

import { AuthStore } from './auth-store';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const token = authStore.token;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
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
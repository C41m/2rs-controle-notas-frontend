// src/app/core/auth-interceptor.service.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { clearAuthAndRedirect } from './auth.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router); // ✅ Router é seguro de injetar

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // ✅ Logout sem depender do AuthService
          clearAuthAndRedirect(this.router);
        }
        return throwError(() => error);
      })
    );
  }
}
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // No reaccionar a 401 si ya estamos cerrando sesión o si es la propia petición de logout
        const isLogoutReq = req.url.includes('/auth/logout');

        if (error.status === 401 && !isLogoutReq && !this.isLoggingOut) {
          this.isLoggingOut = true;
          this.authService.logout().finally(() => (this.isLoggingOut = false));
        } else if (
          error.status === 403 &&
          error.error?.logout &&
          !this.isLoggingOut
        ) {
          this.isLoggingOut = true;
          this.authService
            .logout()
            .then(() => {
              this.router.navigate(['/login'], {
                queryParams: {
                  error:
                    'Tu cuenta ha sido desactivada. Contacta al administrador.',
                },
                replaceUrl: true,
              });
            })
            .finally(() => (this.isLoggingOut = false));
        }
        return throwError(() => error);
      }),
    );
  }
}

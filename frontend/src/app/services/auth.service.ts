import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
  ) {
    this.loadStoredUser();
    this.setupDeepLinkListener();
  }

  private setupDeepLinkListener() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (data: any) => {
        const url = data.url;
        console.log('[DeepLink] URL recibido:', url);

        // Cerrar el browser in-app (Chrome Custom Tabs) inmediatamente
        try {
          await Browser.close();
        } catch (_) {
          // Browser ya estaba cerrado o no aplica
        }

        // Dismiss any loading overlay
        try {
          const loading = await this.loadingController.getTop();
          if (loading) await loading.dismiss();
        } catch (_) {}

        // Verificar si es callback de OAuth
        if (url.includes('auth-callback')) {
          try {
            // Parsear query params manualmente (new URL puede fallar con custom schemes)
            const queryString = url.split('?')[1] || '';
            const params = new URLSearchParams(queryString);
            const code = params.get('code');

            console.log('[DeepLink] code:', code ? 'presente' : 'null');

            if (code) {
              // Intercambiar código por token+user vía API
              try {
                const response: any = await fetch(`${this.apiUrl}/auth/exchange-code`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify({ code }),
                });
                const result = await response.json();

                if (result.success && result.data) {
                  this.setAuth(result.data.user, result.data.token);
                  await new Promise((resolve) => setTimeout(resolve, 100));
                  await this.router.navigate(['/home'], { replaceUrl: true });
                } else {
                  console.error('[DeepLink] Exchange failed:', result.message);
                  await this.router.navigate(['/login'], {
                    queryParams: { error: result.message || 'Error de autenticación' },
                    replaceUrl: true,
                  });
                }
              } catch (error) {
                console.error('[DeepLink] Error intercambiando código:', error);
                await this.router.navigate(['/login'], {
                  queryParams: { error: 'Error conectando con el servidor' },
                  replaceUrl: true,
                });
              }
            } else {
              console.error('[DeepLink] Código faltante en la URL');
              await this.router.navigate(['/login'], {
                queryParams: { error: 'Respuesta de autenticación incompleta' },
                replaceUrl: true,
              });
            }
          } catch (error) {
            console.error('[DeepLink] Error procesando URL:', error);
          }
        } else if (url.includes('login')) {
          // Error en OAuth
          try {
            const queryString = url.split('?')[1] || '';
            const params = new URLSearchParams(queryString);
            const error = params.get('error');
            await this.router.navigate(['/login'], {
              queryParams: {
                error: decodeURIComponent(error || 'Error de autenticación'),
              },
              replaceUrl: true,
            });
          } catch (e) {
            console.error('[DeepLink] Error manejando error:', e);
          }
        }
      });
    }
  }

  private loadStoredUser() {
    const token = this.getToken();
    // Buscar en ambos lugares (auth_user y user)
    const userStr =
      localStorage.getItem(this.userKey) || localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        }),
      );
  }

  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        }),
      );
  }

  async loginWithMicrosoft(): Promise<void> {
    const isMobile = Capacitor.isNativePlatform();

    if (isMobile) {
      // En móvil, usar Chrome Custom Tabs via @capacitor/browser
      const authUrl = `${this.apiUrl}/auth/microsoft?source=mobile_app`;
      console.log('[Auth] Abriendo OAuth móvil:', authUrl);

      // Listener para cuando el usuario cierra el browser manualmente
      const handler = await Browser.addListener('browserFinished', async () => {
        console.log('[Auth] Browser cerrado por el usuario');
        try {
          const loading = await this.loadingController.getTop();
          if (loading) await loading.dismiss();
        } catch (_) {}
        handler.remove();
      });

      await Browser.open({
        url: authUrl,
        windowName: '_self',
      });
    } else {
      // En web, redirect normal
      window.location.href = `${this.apiUrl}/auth/microsoft`;
    }
  }

  handleMicrosoftCallback(code: string): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/auth/microsoft/callback?code=${code}`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        }),
      );
  }

  async logout(): Promise<void> {
    console.log('[AuthService] logout() - START');

    // Guardar el token ANTES de limpiar para poder notificar al backend
    const token = this.getToken();

    // Limpiar localmente primero (evita que el interceptor reaccione a 401)
    this.clearAuth();

    // Redirigir al login sin historial
    await this.router.navigate(['/login'], { replaceUrl: true });

    // Notificar al backend SOLO si teníamos token (petición directa sin interceptor)
    if (token) {
      try {
        await fetch(`${this.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      } catch (_) {
        // Ignorar errores de logout en backend
      }
    }

    console.log('[AuthService] logout() - END');
  }

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/me`);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setToken(response.data.token);
        }
      }),
    );
  }

  private setAuth(user: User, token: string): void {
    // Guardar en ambos formatos para compatibilidad
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Método público para que otros componentes puedan guardar auth (ej: auth-callback)
  public saveAuth(user: User, token: string): void {
    this.setAuth(user, token);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearAuth(): void {
    console.log('[AuthService] clearAuth() - START');
    console.log('[AuthService] localStorage BEFORE clear:', {
      auth_token: localStorage.getItem(this.tokenKey),
      auth_user: localStorage.getItem(this.userKey),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
    });

    // Limpiar todas las claves posibles
    console.log('[AuthService] Removing', this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    console.log('[AuthService] Removing', this.userKey);
    localStorage.removeItem(this.userKey);
    console.log('[AuthService] Removing token');
    localStorage.removeItem('token');
    console.log('[AuthService] Removing user');
    localStorage.removeItem('user');

    console.log('[AuthService] localStorage AFTER clear:', {
      auth_token: localStorage.getItem(this.tokenKey),
      auth_user: localStorage.getItem(this.userKey),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
    });

    console.log('[AuthService] Setting currentUserSubject to null');
    this.currentUserSubject.next(null);
    console.log(
      '[AuthService] currentUserSubject value:',
      this.currentUserSubject.value,
    );
    console.log('[AuthService] clearAuth() - COMPLETED');
  }

  getToken(): string | null {
    // Buscar en ambos lugares (auth_token y token)
    return localStorage.getItem(this.tokenKey) || localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }

    // Si no hay en memoria, buscar en localStorage
    const userStr =
      localStorage.getItem(this.userKey) || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        return user;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

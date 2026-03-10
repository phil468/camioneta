import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoadingController,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.page.html',
  styleUrls: ['./auth-callback.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner],
})
export class AuthCallbackPage implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
  ) {}

  async ngOnInit() {
    console.log('[AuthCallback] ngOnInit START');

    let loading: any = null;

    try {
      console.log('[AuthCallback] Creating loading...');
      // loading = await this.loadingController.create({
      //   message: 'Completando autenticación...',
      // });
      // console.log('[AuthCallback] Loading created');

      // await loading.present();
      console.log('[AuthCallback] Loading presented');
    } catch (loadingError) {
      console.error('[AuthCallback] Error creating loading:', loadingError);
    }

    // Esperar un momento para que el navegador permita acceso a storage
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Obtener parámetros de la URL de forma síncrona
      console.log('[AuthCallback] Getting params...');
      const params = this.route.snapshot.queryParams;
      const token = params['token'];
      const userEncoded = params['user'];

      console.log('[AuthCallback] Params:', {
        hasToken: !!token,
        hasUser: !!userEncoded,
        token: token?.substring(0, 30),
        userEncoded: userEncoded?.substring(0, 50),
      });

      if (token && userEncoded) {
        try {
          // Decodificar datos del usuario
          console.log('[AuthCallback] Decoding user...');
          const user = JSON.parse(atob(userEncoded));
          console.log('[AuthCallback] User decoded:', user);

          // En Chrome Custom Tabs, simplemente procesar normalmente
          // El deep link se encargará de volver a la app          const user = JSON.parse(atob(userEncoded));
          console.log('[AuthCallback] User decoded:', user);

          // Intentar guardar en localStorage directamente
          console.log('[AuthCallback] Attempting to save to localStorage...');

          try {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            console.log('[AuthCallback] localStorage saved successfully');
          } catch (storageError) {
            console.error('[AuthCallback] localStorage failed:', storageError);
            // Continuar de todos modos, el servicio manejará el estado en memoria
          }

          // También usar el servicio (maneja el BehaviorSubject)
          console.log('[AuthCallback] Calling authService.saveAuth...');
          this.authService.saveAuth(user, token);

          console.log('[AuthCallback] Auth saved successfully');

          if (loading) {
            await loading.dismiss();
            console.log('[AuthCallback] Loading dismissed');
          }

          // Pequeño delay antes de redirigir
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Redirigir al home sin historial
          console.log('[AuthCallback] Redirecting to /home');
          await this.router.navigate(['/home'], { replaceUrl: true });
          console.log('[AuthCallback] Navigation complete');
        } catch (decodeError) {
          console.error('[AuthCallback] Error decoding user:', decodeError);
          throw decodeError;
        }
      } else {
        console.error('[AuthCallback] Missing token or user in callback');
        if (loading) await loading.dismiss();
        await this.router.navigate(['/login'], {
          queryParams: { error: 'Datos de autenticación incompletos' },
          replaceUrl: true,
        });
      }
    } catch (error) {
      console.error('[AuthCallback] Error general:', error);
      if (loading) await loading.dismiss();
      await this.router.navigate(['/login'], {
        queryParams: { error: 'Error al procesar la autenticación' },
        replaceUrl: true,
      });
    }
  }
}

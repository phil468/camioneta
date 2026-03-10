import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { PermisosService } from '../services/permisos.service';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class PermisosGuard implements CanActivate {
  private permisosService = inject(PermisosService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const requiredPermission = route.data['permission'] as string;

    // Si no se requiere un permiso específico, permitir acceso
    if (!requiredPermission) {
      return true;
    }

    // Verificar si el usuario tiene el permiso
    if (this.permisosService.tienePermiso(requiredPermission)) {
      return true;
    }

    // Si es administrador, permitir acceso a todo
    if (this.permisosService.esAdministrador()) {
      return true;
    }

    // Mostrar mensaje de error
    await this.mostrarMensajeAccesoDenegado();

    // Redirigir al home
    return this.router.createUrlTree(['/']);
  }

  private async mostrarMensajeAccesoDenegado(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'No tienes permisos para acceder a esta sección.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}

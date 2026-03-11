import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Usuario } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PermisosService {
  constructor(private authService: AuthService) {}

  private getCurrentUser(): Usuario | null {
    return this.authService.getCurrentUser();
  }

  tienePermiso(permiso: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }
    if (user.role.slug === 'administrador') {
      return true;
    }
    return user.role.permisos && (user.role.permisos as any)[permiso] === true;
  }

  esAdministrador(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.slug === 'administrador';
  }

  // Permisos específicos para el nuevo sistema
  puedeReservarCamioneta(): boolean {
    return this.tienePermiso('reserva_camioneta');
  }

  puedeUsarCamioneta(): boolean {
    return this.tienePermiso('uso_camioneta');
  }

  puedeAccederConfiguracion(): boolean {
    return this.tienePermiso('configuracion');
  }

  puedeGestionarUsuarios(): boolean {
    return this.tienePermiso('gestion_usuarios');
  }

  puedeVerAuditoria(): boolean {
    return this.tienePermiso('auditoria');
  }

  puedeVerTodo(): boolean {
    return this.tienePermiso('ver_todo');
  }

  getRolNombre(): string {
    const user = this.getCurrentUser();
    return user?.role?.nombre || 'Sin rol';
  }

  getRolSlug(): string {
    const user = this.getCurrentUser();
    return user?.role?.slug || '';
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }
}

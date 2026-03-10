import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Usuario } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PermisosService {
  constructor(private authService: AuthService) {}

  /**
   * Obtener el usuario actual con su rol
   */
  private getCurrentUser(): Usuario | null {
    return this.authService.getCurrentUser();
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  tienePermiso(permiso: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }

    // Los administradores tienen todos los permisos
    if (user.role.slug === 'administrador') {
      return true;
    }

    // Verificar permiso específico
    return user.role.permisos && (user.role.permisos as any)[permiso] === true;
  }

  /**
   * Verificar si el usuario es administrador
   */
  esAdministrador(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.slug === 'administrador';
  }

  /**
   * Permisos específicos para facilitar uso en templates
   */
  puedeCrearRegistro(): boolean {
    return this.tienePermiso('crear_registro');
  }

  puedeVerRegistros(): boolean {
    return this.tienePermiso('ver_registros');
  }

  puedeAprobarRegistro(): boolean {
    return this.tienePermiso('aprobar_registro');
  }

  puedeRechazarRegistro(): boolean {
    return this.tienePermiso('rechazar_registro');
  }

  puedeAdjuntarGuia(): boolean {
    return this.tienePermiso('adjuntar_guia');
  }

  puedeAccederConfiguracion(): boolean {
    return this.tienePermiso('configuracion');
  }

  puedeExportarExcel(): boolean {
    return this.tienePermiso('exportar_excel');
  }

  puedeGenerarPdf(): boolean {
    return this.tienePermiso('generar_pdf');
  }

  puedeEliminarRegistro(): boolean {
    return this.tienePermiso('eliminar_registro');
  }

  /**
   * Obtener el nombre del rol del usuario actual
   */
  getRolNombre(): string {
    const user = this.getCurrentUser();
    return user?.role?.nombre || 'Sin rol';
  }

  /**
   * Obtener el slug del rol del usuario actual
   */
  getRolSlug(): string {
    const user = this.getCurrentUser();
    return user?.role?.slug || '';
  }
}

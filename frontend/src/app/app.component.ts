import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonAvatar,
  IonNote,
  AlertController,
} from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { PermisosService } from './services/permisos.service';
import { VersionCheckService } from './services/version-check.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonAvatar,
    IonNote,
  ],
})
export class AppComponent {
  user: any = null;
  readonly isNativeApp = Capacitor.isNativePlatform();

  private allMenuItems = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home',
      permission: null, // Todos pueden acceder
    },
    {
      title: 'Uso',
      url: '/uso-camioneta',
      icon: 'car',
      permission: 'uso_camioneta',
    },
    {
      title: 'Reservas',
      url: '/reserva-camioneta',
      icon: 'calendar',
      permission: 'reserva_camioneta',
    },

    // {
    //   title: 'Nuevo Registro',
    //   url: '/registro-form',
    //   icon: 'add-circle',
    //   permission: 'crear_registro',
    // },
    // {
    //   title: 'Lista de Registros',
    //   url: '/registro-lista',
    //   icon: 'list',
    //   permission: 'ver_registros',
    // },
    // {
    //   title: 'Dashboard',
    //   url: '/dashboard',
    //   icon: 'stats-chart',
    //   permission: null, // Todos pueden ver el dashboard
    // },
    {
      title: 'Configuración',
      url: '/configuracion',
      icon: 'settings',
      permission: 'configuracion',
      divider: true,
    },
    // {
    //   title: 'Clientes',
    //   url: '/clientes',
    //   icon: 'people',
    //   permission: 'configuracion',
    // },
    // {
    //   title: 'Choferes',
    //   url: '/choferes',
    //   icon: 'person',
    //   permission: 'configuracion',
    // },
    // {
    //   title: 'Placas',
    //   url: '/placas',
    //   icon: 'car',
    //   permission: 'configuracion',
    // },
    // {
    //   title: 'Jabas',
    //   url: '/descripciones',
    //   icon: 'cube',
    //   permission: 'configuracion',
    // },
    {
      title: 'Usuarios',
      url: '/usuarios',
      icon: 'person-circle',
      permission: 'configuracion', // Solo admin puede gestionar usuarios
    },
  ];

  get menuItems() {
    return this.allMenuItems.filter((item) => {
      // Si no requiere permiso, mostrar siempre
      if (!item.permission) {
        return true;
      }
      // Si es administrador, mostrar todo
      if (this.permisosService.esAdministrador()) {
        return true;
      }
      // Verificar permiso específico
      return this.permisosService.tienePermiso(item.permission);
    });
  }

  constructor(
    private authService: AuthService,
    private permisosService: PermisosService,
    private router: Router,
    private alertController: AlertController,
    private versionCheckService: VersionCheckService,
  ) {
    // Suscribirse a cambios del usuario autenticado
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });

    // Evita carga pesada durante los primeros segundos del arranque.
    setTimeout(() => {
      this.versionCheckService.startPeriodicCheck();
    }, 15000);
  }

  /**
   * Verificar versión manualmente desde el menú
   */
  async checkVersion(): Promise<void> {
    await this.versionCheckService.checkForUpdatesManual();
  }

  get isLoginPage(): boolean {
    return (
      this.router.url === '/login' || this.router.url.startsWith('/login?')
    );
  }

  async logout() {
    console.log('[AppComponent] Logout initiated');
    try {
      const alert = await this.alertController.create({
        header: 'Cerrar sesión',
        message: '¿Estás seguro que deseas cerrar sesión?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Cerrar sesión',
            role: 'confirm',
          },
        ],
      });

      console.log('[AppComponent] Alert created successfully');
      await alert.present();
      console.log('[AppComponent] Alert presented');

      const { role } = await alert.onDidDismiss();
      console.log('[AppComponent] Alert dismissed with role:', role);

      if (role == 'confirm') {
        console.log(
          '[AppComponent] User confirmed logout, calling authService.logout()',
        );
        await this.authService.logout();
        console.log('[AppComponent] authService.logout() completed');
      }

      if (role == 'cancel') {
        console.log('[AppComponent] User cancelled logout');
      }
    } catch (error) {
      console.error('[AppComponent] Error in logout:', error);
    }
  }
}

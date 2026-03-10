import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PermisosGuard } from './guards/permisos.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.page').then(
        (m) => m.AuthCallbackPage
      ),
  },
  {
    path: 'registro-form',
    loadComponent: () =>
      import('./pages/registro-form.page').then((m) => m.RegistroFormPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'crear_registro' },
  },
  {
    path: 'registro-lista',
    loadComponent: () =>
      import('./pages/registro-lista.page').then((m) => m.RegistroListaPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'ver_registros' },
  },
  {
    path: 'registro-detalle/:id',
    loadComponent: () =>
      import('./pages/registro-detalle.page').then(
        (m) => m.RegistroDetallePage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'ver_registros' },
  },
  {
    path: 'registro/nuevo',
    redirectTo: 'registro-form',
    pathMatch: 'full',
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then(
        (m) => m.ConfiguracionPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes-lista.page').then(
        (m) => m.ClientesListaPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'clientes/editar/:id',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'choferes',
    loadComponent: () =>
      import('./pages/choferes/choferes-lista.page').then(
        (m) => m.ChoferesListaPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'choferes/nuevo',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'choferes/editar/:id',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'placas',
    loadComponent: () =>
      import('./pages/placas/placas-lista.page').then((m) => m.PlacasListaPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'placas/nuevo',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'placas/editar/:id',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'descripciones',
    loadComponent: () =>
      import('./pages/descripciones/descripciones-lista.page').then(
        (m) => m.DescripcionesListaPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'descripciones/nuevo',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'descripciones/editar/:id',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/usuarios/usuarios-lista.page').then(
        (m) => m.UsuariosListaPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'usuarios/editar/:id',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'importar-choferes',
    loadComponent: () =>
      import('./pages/importar-choferes/importar-choferes.page').then(
        (m) => m.ImportarChoferesPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'importar-descripciones',
    loadComponent: () =>
      import('./pages/importar-descripciones/importar-descripciones.page').then(
        (m) => m.ImportarDescripcionesPage
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

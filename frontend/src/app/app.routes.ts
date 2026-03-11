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
        (m) => m.AuthCallbackPage,
      ),
  },
  // === RESERVA DE CAMIONETA ===
  {
    path: 'reserva-camioneta',
    loadComponent: () =>
      import('./pages/reserva-camioneta/reserva-camioneta.page').then(
        (m) => m.ReservaCamionetaPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'reserva_camioneta' },
  },
  // === USO DE CAMIONETA ===
  {
    path: 'uso-camioneta',
    loadComponent: () =>
      import('./pages/uso-camioneta/uso-camioneta.page').then(
        (m) => m.UsoCamionetaPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'uso_camioneta' },
  },
  // === CONFIGURACIÓN ===
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then(
        (m) => m.ConfiguracionPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  // === CAMIONETAS CRUD ===
  {
    path: 'camionetas',
    loadComponent: () =>
      import('./pages/camionetas/camionetas-lista.page').then(
        (m) => m.CamionetasListaPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'camionetas/nuevo',
    loadComponent: () =>
      import('./pages/camionetas/camioneta-form.page').then(
        (m) => m.CamionetaFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'camionetas/editar/:id',
    loadComponent: () =>
      import('./pages/camionetas/camioneta-form.page').then(
        (m) => m.CamionetaFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  // === CHECKLIST ITEMS CRUD ===
  {
    path: 'checklist-items',
    loadComponent: () =>
      import('./pages/checklist-items/checklist-items-lista.page').then(
        (m) => m.ChecklistItemsListaPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'checklist-items/nuevo',
    loadComponent: () =>
      import('./pages/checklist-items/checklist-item-form.page').then(
        (m) => m.ChecklistItemFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'checklist-items/editar/:id',
    loadComponent: () =>
      import('./pages/checklist-items/checklist-item-form.page').then(
        (m) => m.ChecklistItemFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  // === USUARIOS CRUD ===
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/usuarios/usuarios-lista.page').then(
        (m) => m.UsuariosListaPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  {
    path: 'usuarios/editar/:id',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage,
      ),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'configuracion' },
  },
  // === AUDITORÍA ===
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./pages/auditoria/auditoria.page').then((m) => m.AuditoriaPage),
    canActivate: [AuthGuard, PermisosGuard],
    data: { permission: 'auditoria' },
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

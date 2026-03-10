import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Usuario } from '../../services/api.service';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonSearchbar,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuarios-lista',
  templateUrl: './usuarios-lista.page.html',
  styleUrls: ['./usuarios-lista.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonSearchbar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonSpinner,
  ],
})
export class UsuariosListaPage implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  loading = false;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.loading = true;
    try {
      const response = await this.apiService.getUsuarios().toPromise();
      this.usuarios = response?.data || [];
      this.usuariosFiltrados = [...this.usuarios];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.mostrarError('Error al cargar la lista de usuarios');
    } finally {
      this.loading = false;
    }
  }

  buscar(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        usuario.name.toLowerCase().includes(searchTerm) ||
        usuario.email.toLowerCase().includes(searchTerm),
    );
  }

  nuevoUsuario() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(id: number) {
    this.router.navigate(['/usuarios/editar', id]);
  }

  async eliminarUsuario(usuario: Usuario) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario "${usuario.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.apiService.deleteUsuario(usuario.id).toPromise();
              await this.cargarUsuarios();
              this.mostrarExito('Usuario eliminado correctamente');
            } catch (error) {
              this.mostrarError('Error al eliminar el usuario');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleEstado(usuario: Usuario) {
    try {
      await this.apiService
        .updateUsuario(usuario.id, {
          activo: !usuario.activo,
          name: usuario.name,
          email: usuario.email,
        })
        .toPromise();

      usuario.activo = !usuario.activo;
      this.mostrarExito(
        `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`,
      );
    } catch (error) {
      this.mostrarError('Error al cambiar el estado del usuario');
    }
  }

  doRefresh(event: any) {
    this.cargarUsuarios().then(() => {
      event.target.complete();
    });
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrarExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  volver() {
    this.router.navigate(['/configuracion']);
  }
}

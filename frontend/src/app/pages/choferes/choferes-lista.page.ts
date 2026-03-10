import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Chofer } from '../../services/api.service';
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
  IonSpinner,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-choferes-lista',
  templateUrl: './choferes-lista.page.html',
  styleUrls: ['./choferes-lista.page.scss'],
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
    IonSpinner,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonFab,
    IonFabButton,
  ],
})
export class ChoferesListaPage implements OnInit {
  choferes: Chofer[] = [];
  choferesFiltrados: Chofer[] = [];
  loading = false;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    // El cargarChoferes() se ejecutará en ionViewWillEnter()
  }

  ionViewWillEnter() {
    this.cargarChoferes();
  }

  async cargarChoferes() {
    this.loading = true;
    try {
      const response = await this.apiService.getChoferes().toPromise();
      this.choferes = response?.data || [];
      this.choferesFiltrados = [...this.choferes];
    } catch (error) {
      console.error('Error al cargar choferes:', error);
      this.mostrarError('Error al cargar la lista de choferes');
    } finally {
      this.loading = false;
    }
  }

  buscar(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.choferesFiltrados = [...this.choferes];
      return;
    }

    this.choferesFiltrados = this.choferes.filter(
      (chofer) =>
        chofer.nombre.toLowerCase().includes(searchTerm) ||
        chofer.dni.toLowerCase().includes(searchTerm) ||
        chofer.licencia?.toLowerCase().includes(searchTerm),
    );
  }

  nuevoChofer() {
    this.router.navigate(['/choferes/nuevo']);
  }

  editarChofer(id: number) {
    this.router.navigate(['/choferes/editar', id]);
  }

  async eliminarChofer(chofer: Chofer) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al chofer "${chofer.nombre}"?`,
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
              await this.apiService.deleteChofer(chofer.id).toPromise();
              await this.cargarChoferes();
              this.mostrarExito('Chofer eliminado correctamente');
            } catch (error) {
              this.mostrarError('Error al eliminar el chofer');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleEstado(chofer: Chofer) {
    try {
      await this.apiService
        .updateChofer(chofer.id, {
          dni: chofer.dni,
          nombre: chofer.nombre,
          activo: !chofer.activo,
        })
        .toPromise();

      chofer.activo = !chofer.activo;
      this.mostrarExito(
        `Chofer ${chofer.activo ? 'activado' : 'desactivado'} correctamente`,
      );
    } catch (error) {
      this.mostrarError('Error al cambiar el estado del chofer');
    }
  }

  doRefresh(event: any) {
    this.cargarChoferes().then(() => {
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

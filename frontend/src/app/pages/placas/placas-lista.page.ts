import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Placa } from '../../services/api.service';
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
  IonLabel,
  IonBadge,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-placas-lista',
  templateUrl: './placas-lista.page.html',
  styleUrls: ['./placas-lista.page.scss'],
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
    IonLabel,
    IonBadge,
    IonFab,
    IonFabButton,
  ],
})
export class PlacasListaPage implements OnInit {
  placas: Placa[] = [];
  placasFiltradas: Placa[] = [];
  loading = false;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarPlacas();
  }

  async cargarPlacas() {
    this.loading = true;
    try {
      this.placas = (await this.apiService.getPlacas().toPromise()) || [];
      this.placasFiltradas = [...this.placas];
    } catch (error) {
      console.error('Error al cargar placas:', error);
      this.mostrarError('Error al cargar la lista de placas');
    } finally {
      this.loading = false;
    }
  }

  buscar(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.placasFiltradas = [...this.placas];
      return;
    }

    this.placasFiltradas = this.placas.filter(
      (placa) =>
        placa.numero_placa.toLowerCase().includes(searchTerm) ||
        placa.tipo_vehiculo?.toLowerCase().includes(searchTerm) ||
        placa.marca?.toLowerCase().includes(searchTerm),
    );
  }

  nuevaPlaca() {
    this.router.navigate(['/placas/nuevo']);
  }

  editarPlaca(id: number) {
    this.router.navigate(['/placas/editar', id]);
  }

  async eliminarPlaca(placa: Placa) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la placa "${placa.numero_placa}"?`,
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
              await this.apiService.deletePlaca(placa.id).toPromise();
              await this.cargarPlacas();
              this.mostrarExito('Placa eliminada correctamente');
            } catch (error) {
              this.mostrarError('Error al eliminar la placa');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleEstado(placa: Placa) {
    try {
      await this.apiService
        .updatePlaca(placa.id, {
          numero_placa: placa.numero_placa,
          activo: !placa.activo,
        })
        .toPromise();

      placa.activo = !placa.activo;
      this.mostrarExito(
        `Placa ${placa.activo ? 'activada' : 'desactivada'} correctamente`,
      );
    } catch (error) {
      this.mostrarError('Error al cambiar el estado de la placa');
    }
  }

  doRefresh(event: any) {
    this.cargarPlacas().then(() => {
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

  getTipoIcon(tipo: string | undefined): string {
    switch (tipo?.toLowerCase()) {
      case 'camión':
        return 'car-sport-outline';
      case 'furgoneta':
        return 'bus-outline';
      case 'camioneta':
        return 'car-outline';
      default:
        return 'car-outline';
    }
  }

  volver() {
    this.router.navigate(['/configuracion']);
  }
}

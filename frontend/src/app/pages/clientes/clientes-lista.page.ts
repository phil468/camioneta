import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Cliente } from '../../services/api.service';
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
  selector: 'app-clientes-lista',
  templateUrl: './clientes-lista.page.html',
  styleUrls: ['./clientes-lista.page.scss'],
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
export class ClientesListaPage implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = false;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    // this.cargarClientes();
  }

  ionViewWillEnter() {
    this.cargarClientes();
  }

  async cargarClientes() {
    this.loading = true;
    try {
      this.clientes = (await this.apiService.getClientes().toPromise()) || [];
      this.clientesFiltrados = [...this.clientes];
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      this.mostrarError('Error al cargar la lista de clientes');
    } finally {
      this.loading = false;
    }
  }

  buscar(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm) ||
        cliente.codigo?.toLowerCase().includes(searchTerm) ||
        cliente.ruc?.toLowerCase().includes(searchTerm),
    );
  }

  nuevoCliente() {
    this.router.navigate(['/clientes/nuevo']);
  }

  editarCliente(id: number) {
    this.router.navigate(['/clientes/editar', id]);
  }

  async eliminarCliente(cliente: Cliente) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el cliente "${cliente.nombre}"?`,
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
              await this.apiService.deleteCliente(cliente.id).toPromise();
              await this.cargarClientes();
              this.mostrarExito('Cliente eliminado correctamente');
            } catch (error) {
              this.mostrarError('Error al eliminar el cliente');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleEstado(cliente: Cliente) {
    try {
      await this.apiService
        .updateCliente(cliente.id, {
          // dni: cliente.dni,
          nombre: cliente.nombre,
          activo: !cliente.activo,
        })
        .toPromise();

      cliente.activo = !cliente.activo;
      this.mostrarExito(
        `Cliente ${cliente.activo ? 'activado' : 'desactivado'} correctamente`,
      );
    } catch (error) {
      this.mostrarError('Error al cambiar el estado del cliente');
    }
  }

  doRefresh(event: any) {
    this.cargarClientes().then(() => {
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

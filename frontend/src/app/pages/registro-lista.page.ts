import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonFab,
  IonFabButton,
  IonText,
  IonModal,
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService, Registro } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { PermisosService } from '../services/permisos.service';
import { ImageViewerModalComponent } from '../components/image-viewer-modal.component';
import { AdjuntarGuiaModalComponent } from '../components/adjuntar-guia-modal.component';
import { PdfPreviewModalComponent } from '../components/pdf-preview-modal.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-registro-lista',
  templateUrl: './registro-lista.page.html',
  styleUrls: ['./registro-lista.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonList,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonBadge,
    IonFab,
    IonFabButton,
    IonText,
    IonModal,
  ],
})
export class RegistroListaPage implements OnInit {
  registros: Registro[] = [];
  registrosFiltrados: Registro[] = [];
  loading = false;
  isLoadingData = false; // Flag para evitar llamadas múltiples

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  clienteId: number | null = null;
  estado: string = '';
  searchTerm: string = '';

  // Clientes para el filtro
  clientes: any[] = [];

  // Paginación
  currentPage = 1;
  totalPages = 1;
  perPage = 15;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public permisosService: PermisosService,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // this.cargarClientes();
  }

  ionViewWillEnter() {
    this.cargarRegistros();
  }

  async cargarClientes() {
    try {
      this.apiService.getClientesActivos().subscribe({
        next: (response) => {
          this.clientes = response.data || [];
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
        },
      });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  cargarRegistros() {
    // Evitar llamadas múltiples simultáneas
    if (this.isLoadingData) {
      console.log('Ya hay una carga en proceso, omitiendo...');
      return;
    }

    this.isLoadingData = true;
    this.loading = true;

    const filtros: any = {
      per_page: this.perPage,
      page: this.currentPage,
    };

    // Formatear fechas correctamente (extraer solo YYYY-MM-DD)
    if (this.fechaInicio) {
      const fecha = new Date(this.fechaInicio);
      filtros.fecha_inicio = fecha.toISOString().split('T')[0];
    }
    if (this.fechaFin) {
      const fecha = new Date(this.fechaFin);
      filtros.fecha_fin = fecha.toISOString().split('T')[0];
    }
    if (this.clienteId) filtros.cliente_id = this.clienteId;
    if (this.estado) filtros.estado = this.estado;
    if (this.searchTerm) filtros.search = this.searchTerm;

    console.log('Cargando registros con filtros:', filtros);

    this.apiService.getRegistros(filtros).subscribe({
      next: (response) => {
        console.log('Respuesta de registros:', response);
        this.registros = response.data || [];
        this.registrosFiltrados = [...this.registros];
        this.totalPages = response.last_page || 1;
        this.currentPage = response.current_page || 1;
        console.log('Registros cargados:', this.registros.length);

        // Liberar flags y forzar detección de cambios
        this.loading = false;
        this.isLoadingData = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar registros:', error);
        this.registros = [];
        this.registrosFiltrados = [];

        // Liberar flags y forzar detección de cambios
        this.loading = false;
        this.isLoadingData = false;
        this.cdr.detectChanges();
      },
    });
  }

  aplicarFiltros() {
    this.currentPage = 1;
    this.cargarRegistros();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.clienteId = null;
    this.estado = '';
    this.searchTerm = '';
    this.cargarRegistros();
  }

  buscar(event: any) {
    this.searchTerm = event.target.value;
    if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
      this.aplicarFiltros();
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/registro-detalle', id]);
  }

  nuevoRegistro() {
    this.router.navigate(['/registro-form']);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'por_aprobar':
        return 'medium';
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'por_aprobar':
        return 'Por Aprobar';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return estado;
    }
  }

  async cambiarEstado(registro: Registro) {
    // Se implementará con el modal de cambio de estado
    console.log('Cambiar estado:', registro);
  }

  async aprobar(registro: Registro) {
    const alert = await this.alertCtrl.create({
      header: 'Aprobar Registro',
      message: `¿Estás seguro de aprobar el registro ${registro.numero_registro}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aprobar',
          handler: async () => {
            try {
              if (registro.id) {
                const currentUser = this.authService.getCurrentUser();
                await this.apiService
                  .cambiarEstadoRegistro(
                    registro.id,
                    'aprobado',
                    undefined,
                    currentUser?.id
                  )
                  .toPromise();

                const successAlert = await this.alertCtrl.create({
                  header: 'Éxito',
                  message: 'Registro aprobado correctamente',
                  buttons: ['OK'],
                });
                await successAlert.present();

                this.aplicarFiltros();
              }
            } catch (error) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'Error al aprobar el registro',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async rechazar(registro: Registro) {
    const alert = await this.alertCtrl.create({
      header: 'Rechazar Registro',
      message:
        'Por favor, indica el motivo del rechazo. Este comentario será visible para el usuario que creó el registro.',
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Ejemplo: Faltan firmas, datos incorrectos, etc.',
          attributes: {
            rows: 4,
            maxlength: 500,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Rechazar',
          cssClass: 'danger',
          handler: async (data) => {
            if (!data.motivo || data.motivo.trim().length < 10) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'El motivo debe tener al menos 10 caracteres',
                buttons: ['OK'],
              });
              await errorAlert.present();
              return false;
            }

            try {
              if (registro.id) {
                const currentUser = this.authService.getCurrentUser();
                await this.apiService
                  .cambiarEstadoRegistro(
                    registro.id,
                    'rechazado',
                    data.motivo.trim(),
                    currentUser?.id
                  )
                  .toPromise();

                const successAlert = await this.alertCtrl.create({
                  header: 'Registro Rechazado',
                  message: 'El registro ha sido rechazado correctamente',
                  buttons: ['OK'],
                });
                await successAlert.present();

                this.aplicarFiltros();
              }
            } catch (error) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'Error al rechazar el registro',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async verImagen(imagePath: string) {
    // Construir URL completa de la imagen
    const imageUrl = `${environment.apiUrl.replace(
      '/api/v1',
      ''
    )}/storage/${imagePath}`;

    const modal = await this.modalCtrl.create({
      component: ImageViewerModalComponent,
      componentProps: {
        imageUrl: imageUrl,
      },
      cssClass: 'image-viewer-modal',
    });

    await modal.present();
  }

  async verGuiaPDF(registro: Registro, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (!registro.pdf_path) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No hay guía de remisión adjunta',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      const blob = await this.apiService
        .descargarGuiaPdf(registro.id!)
        .toPromise();

      if (!blob) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Error al obtener el PDF de la guía',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      const fileName = `Guia_${registro.serie_guia || ''}-${
        registro.numero_guia || registro.id
      }.pdf`;

      // Abrir modal de vista previa
      const modal = await this.modalCtrl.create({
        component: PdfPreviewModalComponent,
        componentProps: {
          pdfBlob: blob,
          fileName: fileName,
        },
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();

      // Si el usuario presiona "Descargar" en el modal
      if (role === 'download' && data?.download) {
        this.descargarGuiaPDF(registro);
      }
    } catch (error) {
      console.error('Error al visualizar la guía:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Error al visualizar la guía de remisión',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async descargarGuiaPDF(registro: Registro, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (!registro.pdf_path) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No hay guía de remisión adjunta',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      const blob = await this.apiService
        .descargarGuiaPdf(registro.id!)
        .toPromise();

      if (!blob) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Error al descargar el PDF de la guía',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      const fileName = `Guia_${registro.serie_guia || ''}-${
        registro.numero_guia || registro.id
      }.pdf`;

      // Web: usar descarga tradicional
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la guía:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Error al descargar la guía de remisión',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async adjuntarPDF(registro: Registro, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Validar que el registro esté aprobado
    if (registro.estado !== 'aprobado') {
      const alert = await this.alertCtrl.create({
        header: 'Acción no permitida',
        message:
          'Solo se puede adjuntar una guía cuando el registro está aprobado',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Abrir modal para adjuntar guía (igual que en registro-detalle)
    const modal = await this.modalCtrl.create({
      component: AdjuntarGuiaModalComponent,
      componentProps: {
        registroId: registro.id,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      try {
        // Enviar FormData al backend
        const response = await this.apiService
          .adjuntarPdfRegistro(registro.id!, data.formData)
          .toPromise();

        if (response?.success) {
          const successAlert = await this.alertCtrl.create({
            header: 'Éxito',
            message: `Guía de Remisión ${data.data.serie_guia}-${data.data.numero_guia} adjuntada correctamente`,
            buttons: ['OK'],
          });
          await successAlert.present();

          // Recargar la lista
          this.aplicarFiltros();
        }
      } catch (error) {
        console.error('Error al adjuntar guía:', error);
        const errorAlert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Error al adjuntar la guía de remisión',
          buttons: ['OK'],
        });
        await errorAlert.present();
      }
    }
  }

  async exportarExcel() {
    try {
      const filtros: any = {};

      // Formatear fechas correctamente
      if (this.fechaInicio) {
        const fecha = new Date(this.fechaInicio);
        filtros.fecha_inicio = fecha.toISOString().split('T')[0];
      }
      if (this.fechaFin) {
        const fecha = new Date(this.fechaFin);
        filtros.fecha_fin = fecha.toISOString().split('T')[0];
      }
      if (this.clienteId) filtros.cliente_id = this.clienteId;
      if (this.estado) filtros.estado = this.estado;

      const blob = await this.apiService.exportarRegistros(filtros).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Registros_${
          new Date().toISOString().split('T')[0]
        }.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Excel exportado exitosamente');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarRegistros();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarRegistros();
    }
  }

  doRefresh(event: any) {
    this.cargarRegistros();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}

// doRefresh(event: any) {
//   this.cargarRegistros().then(() => {
//     event.target.complete();
//   });
// }
// }

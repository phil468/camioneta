import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  ModalController,
  Platform,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonIcon,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Registro } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { PermisosService } from '../services/permisos.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { PdfPreviewModalComponent } from '../components/pdf-preview-modal.component';
import { AdjuntarGuiaModalComponent } from '../components/adjuntar-guia-modal.component';

@Component({
  selector: 'app-registro-detalle',
  templateUrl: './registro-detalle.page.html',
  styleUrls: ['./registro-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge,
    IonIcon,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class RegistroDetallePage implements OnInit {
  registro: Registro | null = null;
  loading = true;
  registroId: number = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public permisosService: PermisosService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private platform: Platform,
  ) {}

  ngOnInit() {
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarRegistro();
  }

  async cargarRegistro() {
    this.loading = true;
    try {
      const response = await this.apiService
        .getRegistro(this.registroId)
        .toPromise();
      this.registro = response?.data || null;
    } catch (error) {
      console.error('Error al cargar registro:', error);
      this.mostrarError('No se pudo cargar el registro');
    } finally {
      this.loading = false;
    }
  }

  async aprobar() {
    const alert = await this.alertController.create({
      header: 'Aprobar Registro',
      message: '¿Estás seguro de aprobar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aprobar',
          handler: async () => {
            try {
              const currentUser = this.authService.getCurrentUser();
              await this.apiService
                .cambiarEstadoRegistro(
                  this.registroId,
                  'aprobado',
                  undefined,
                  currentUser?.id,
                )
                .toPromise();

              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Registro aprobado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.cargarRegistro();
            } catch (error) {
              this.mostrarError('Error al aprobar el registro');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async rechazar() {
    const alert = await this.alertController.create({
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
              this.mostrarError('El motivo debe tener al menos 10 caracteres');
              return false;
            }

            try {
              const currentUser = this.authService.getCurrentUser();
              await this.apiService
                .cambiarEstadoRegistro(
                  this.registroId,
                  'rechazado',
                  data.motivo.trim(),
                  currentUser?.id,
                )
                .toPromise();

              const successAlert = await this.alertController.create({
                header: 'Registro Rechazado',
                message: 'El registro ha sido rechazado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.cargarRegistro();
            } catch (error) {
              this.mostrarError('Error al rechazar el registro');
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async verImagen() {
    if (this.registro?.imagen_path) {
      // TODO: Implementar modal para ver imagen
      const imageUrl = `${this.apiService['apiUrl'].replace(
        '/api/v1',
        '',
      )}/storage/${this.registro.imagen_path}`;
      window.open(imageUrl, '_blank');
    }
  }

  async previsualizarPDF() {
    try {
      const blob = await this.apiService
        .generarPdfRegistro(this.registroId)
        .toPromise();

      if (!blob) {
        this.mostrarError('Error al generar el PDF');
        return;
      }

      const fileName = `Registro_${
        this.registro?.numero_registro || this.registroId
      }.pdf`;

      // Abrir modal de vista previa
      const modal = await this.modalController.create({
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
        this.descargarPDF();
      }
    } catch (error) {
      console.error('Error al generar vista previa:', error);
      this.mostrarError('Error al generar la vista previa del PDF');
    }
  }

  async descargarPDF() {
    try {
      const blob = await this.apiService
        .generarPdfRegistro(this.registroId)
        .toPromise();
      if (!blob) {
        this.mostrarError('Error al generar el PDF');
        return;
      }

      const fileName = `Registro_${
        this.registro?.numero_registro || this.registroId
      }.pdf`;

      // Detectar si es móvil (Android/iOS) o web
      if (this.platform.is('capacitor')) {
        // Móvil: usar Capacitor Filesystem
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const base64String = base64Data.split(',')[1]; // Remover el prefijo data:application/pdf;base64,

          try {
            // Guardar el archivo en el directorio de documentos
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64String,
              directory: Directory.Documents,
            });

            // Mostrar alerta de éxito
            const alert = await this.alertController.create({
              header: 'PDF Descargado',
              message: `El archivo se guardó en Documentos/${fileName}`,
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel',
                },
                {
                  text: 'Abrir',
                  handler: async () => {
                    try {
                      await FileOpener.open({
                        filePath: savedFile.uri,
                        contentType: 'application/pdf',
                      });
                    } catch (error) {
                      console.error('Error al abrir PDF:', error);
                      this.mostrarError('No se pudo abrir el archivo PDF');
                    }
                  },
                },
              ],
            });
            await alert.present();
          } catch (error) {
            console.error('Error al guardar PDF:', error);
            this.mostrarError('Error al guardar el PDF en el dispositivo');
          }
        };
      } else {
        // Web: usar descarga tradicional
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.mostrarError('Error al generar el PDF');
    }
  }

  async verGuiaPDF() {
    if (!this.registro?.pdf_path) {
      this.mostrarError('No hay guía de remisión adjunta');
      return;
    }

    try {
      const blob = await this.apiService
        .descargarGuiaPdf(this.registroId)
        .toPromise();

      if (!blob) {
        this.mostrarError('Error al obtener el PDF de la guía');
        return;
      }

      const fileName = `Guia_${this.registro?.serie_guia || ''}-${
        this.registro?.numero_guia || this.registroId
      }.pdf`;

      // Abrir modal de vista previa
      const modal = await this.modalController.create({
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
        this.descargarGuiaPDF();
      }
    } catch (error) {
      console.error('Error al visualizar la guía:', error);
      this.mostrarError('Error al visualizar la guía de remisión');
    }
  }

  async descargarGuiaPDF() {
    if (!this.registro?.pdf_path) {
      this.mostrarError('No hay guía de remisión adjunta');
      return;
    }

    try {
      const blob = await this.apiService
        .descargarGuiaPdf(this.registroId)
        .toPromise();

      if (!blob) {
        this.mostrarError('Error al descargar el PDF de la guía');
        return;
      }

      const fileName = `Guia_${this.registro?.serie_guia || ''}-${
        this.registro?.numero_guia || this.registroId
      }.pdf`;

      // Detectar si es móvil (Android/iOS) o web
      if (this.platform.is('capacitor')) {
        // Móvil: usar Capacitor Filesystem
        const { Filesystem, Directory } = await import('@capacitor/filesystem');

        // Convertir blob a base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const base64String = base64Data.split(',')[1];

          try {
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64String,
              directory: Directory.Documents,
            });

            const successAlert = await this.alertController.create({
              header: 'Éxito',
              message: `Guía descargada en: ${result.uri}`,
              buttons: ['OK'],
            });
            await successAlert.present();
          } catch (error) {
            console.error('Error al guardar archivo:', error);
            this.mostrarError('Error al guardar la guía');
          }
        };
      } else {
        // Web: usar descarga tradicional
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al descargar la guía:', error);
      this.mostrarError('Error al descargar la guía de remisión');
    }
  }

  async adjuntarPDF() {
    // Validar que el registro esté aprobado
    if (this.registro?.estado !== 'aprobado') {
      const alert = await this.alertController.create({
        header: 'Acción no permitida',
        message:
          'Solo se puede adjuntar una guía cuando el registro está aprobado',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Abrir modal para adjuntar guía
    const modal = await this.modalController.create({
      component: AdjuntarGuiaModalComponent,
      componentProps: {
        registroId: this.registroId,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      try {
        // Enviar FormData al backend
        const response = await this.apiService
          .adjuntarPdfRegistro(this.registroId, data.formData)
          .toPromise();

        if (response?.success) {
          const successAlert = await this.alertController.create({
            header: 'Éxito',
            message: `Guía de Remisión ${data.data.serie_guia}-${data.data.numero_guia} adjuntada correctamente`,
            buttons: ['OK'],
          });
          await successAlert.present();

          // Recargar el registro
          this.cargarRegistro();
        }
      } catch (error) {
        console.error('Error al adjuntar guía:', error);
        this.mostrarError('Error al adjuntar la guía de remisión');
      }
    }
  }

  async compartir() {
    // TODO: Implementar compartir
    // this.mostrarError('Función en desarrollo');
  }

  async eliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este registro?',
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
              await this.apiService.deleteRegistro(this.registroId);

              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Registro eliminado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.router.navigate(['/registro-lista']);
            } catch (error) {
              this.mostrarError('Error al eliminar el registro');
            }
          },
        },
      ],
    });

    await alert.present();
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

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  volver() {
    this.router.navigate(['/registro-lista']);
  }

  getImageUrl(imagePath: string): string {
    return `${this.apiService['apiUrl'].replace(
      '/api/v1',
      '',
    )}/storage/${imagePath}`;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonSpinner,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { ApiService, ImportResult } from '../../services/api.service';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-importar-choferes',
  templateUrl: './importar-choferes.page.html',
  styleUrls: ['./importar-choferes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonNote,
    IonSpinner,
  ],
})
export class ImportarChoferesPage {
  selectedFile: File | null = null;
  loading = false;
  resultado: ImportResult | null = null;

  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ cloudUploadOutline, documentTextOutline });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar extensión
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
        this.mostrarError(
          'Formato de archivo no válido. Use Excel (.xlsx, .xls) o CSV'
        );
        return;
      }

      this.selectedFile = file;
      this.resultado = null;
    }
  }

  async importar() {
    if (!this.selectedFile) {
      this.mostrarError('Por favor seleccione un archivo');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Importación',
      message:
        '¿Desea importar los choferes desde este archivo? Los choferes existentes (mismo DNI) serán actualizados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Importar',
          handler: async () => {
            await this.ejecutarImportacion();
          },
        },
      ],
    });

    await alert.present();
  }

  async ejecutarImportacion() {
    if (!this.selectedFile) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .importarChoferes(this.selectedFile)
        .toPromise();

      this.resultado = response || null;

      if (response?.success) {
        const toast = await this.toastCtrl.create({
          message: `Importación exitosa: ${response.imported || 0} nuevos, ${
            response.updated || 0
          } actualizados`,
          duration: 5000,
          color: 'success',
        });
        await toast.present();

        // Limpiar archivo seleccionado
        this.selectedFile = null;
        const fileInput = document.getElementById(
          'fileInput'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error al importar:', error);
      this.mostrarError(
        error?.error?.message || 'Error al importar el archivo'
      );
    } finally {
      this.loading = false;
    }
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }

  descargarPlantilla() {
    // Crear un CSV de ejemplo
    const csv = `CLIENTE,CHOFER,DNI,PLACA
ESPARRAGOS DEL PERÚ,DONAL VALENCIA CAHUANA,44493638,C0Q-784
ESPARRAGOS DEL PERÚ,POLFENCIO ALARCON ROJAS,75066033,C2Z-926`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_choferes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

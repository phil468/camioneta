import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSpinner,
  IonList,
  IonBadge,
  IonChip,
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  carSportOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  cameraOutline,
  saveOutline,
  stopCircleOutline,
  playCircleOutline,
  timeOutline,
  listOutline,
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  ApiService,
  Camioneta,
  ChecklistItem,
  UsoCamioneta,
  UsoChecklistRespuesta,
} from '../../services/api.service';
import { PermisosService } from '../../services/permisos.service';
import { environment } from '../../../environments/environment';

interface ChecklistFormItem {
  checklist_item_id: number;
  nombre: string;
  descripcion?: string;
  respuesta: boolean;
  foto?: string;
  fotoFile?: File;
  comentario: string;
}

@Component({
  selector: 'app-uso-camioneta',
  templateUrl: './uso-camioneta.page.html',
  styleUrls: ['./uso-camioneta.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonLabel,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonSpinner,
    IonList,
    IonBadge,
    IonChip,
  ],
})
export class UsoCamionetaPage implements OnInit {
  // Vista: 'lista' | 'nuevo' | 'detalle'
  vista: 'lista' | 'nuevo' | 'detalle' = 'lista';

  camionetas: Camioneta[] = [];
  checklistItems: ChecklistItem[] = [];
  usos: UsoCamioneta[] = [];
  loading = false;

  // Formulario nuevo uso
  selectedCamionetaId: number | null = null;
  observaciones = '';
  checklistForm: ChecklistFormItem[] = [];

  // Guard contra doble-submit
  guardando = false;

  // Detalle
  usoDetalle: UsoCamioneta | null = null;
  fotoAmpliadaUrl: string | null = null;

  private storageBaseUrl = environment.apiUrl.replace(
    /\/api\/v1$/,
    '/storage/',
  );

  constructor(
    private apiService: ApiService,
    public permisos: PermisosService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
    addIcons({
      carSportOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      cameraOutline,
      saveOutline,
      stopCircleOutline,
      playCircleOutline,
      timeOutline,
      listOutline,
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadCamionetas();
    this.loadChecklistItems();
    this.loadUsos();
  }

  loadCamionetas() {
    this.apiService.getCamionetasActivas().subscribe({
      next: (res) => {
        this.camionetas = res.data || [];
        if (this.camionetas.length === 1) {
          this.selectedCamionetaId = this.camionetas[0].id;
        }
      },
    });
  }

  loadChecklistItems() {
    this.apiService.getChecklistItemsActivos().subscribe({
      next: (res) => {
        this.checklistItems = res.data || [];
        this.initChecklistForm();
      },
    });
  }

  loadUsos() {
    this.loading = true;
    const filters: any = {};

    // Personal solo ve sus propios usos
    if (!this.permisos.puedeVerTodo()) {
      filters.solo_propias = true;
    }

    this.apiService.getUsosCamioneta(filters).subscribe({
      next: (res) => {
        this.usos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  initChecklistForm() {
    this.checklistForm = this.checklistItems.map((item) => ({
      checklist_item_id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      respuesta: true, // Por defecto todo en "Sí"
      comentario: '',
    }));
  }

  mostrarNuevo() {
    this.vista = 'nuevo';
    this.initChecklistForm();
    this.observaciones = '';
  }

  mostrarLista() {
    this.vista = 'lista';
    this.loadUsos();
  }

  async tomarFoto(item: ChecklistFormItem) {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        item.foto = image.dataUrl;
      }
    } catch (err) {
      console.error('Error tomando foto:', err);
    }
  }

  async guardarUso() {
    if (this.guardando) return;

    if (!this.selectedCamionetaId) {
      const toast = await this.toastController.create({
        message: 'Selecciona una camioneta',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    this.guardando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    const formData = new FormData();
    formData.append('camioneta_id', this.selectedCamionetaId.toString());
    if (this.observaciones) {
      formData.append('observaciones', this.observaciones);
    }

    for (let i = 0; i < this.checklistForm.length; i++) {
      const item = this.checklistForm[i];
      formData.append(
        `checklist[${i}][checklist_item_id]`,
        item.checklist_item_id.toString(),
      );
      formData.append(
        `checklist[${i}][respuesta]`,
        item.respuesta ? '1' : '0',
      );
      if (item.comentario) {
        formData.append(`checklist[${i}][comentario]`, item.comentario);
      }
      if (item.foto) {
        const response = await fetch(item.foto);
        const blob = await response.blob();
        const file = new File([blob], `checklist_${i}.jpg`, {
          type: blob.type || 'image/jpeg',
        });
        formData.append(`foto_${i}`, file);
      }
    }

    this.apiService.createUsoCamionetaConFotos(formData).subscribe({
      next: async () => {
        await loading.dismiss();
        this.guardando = false;
        const toast = await this.toastController.create({
          message: 'Uso registrado. Estado: EN USO',
          duration: 3000,
          color: 'success',
        });
        await toast.present();
        this.mostrarLista();
      },
      error: async (err) => {
        await loading.dismiss();
        this.guardando = false;
        const errorMsg = err.error?.message || 'Error al guardar';
        const alert = await this.alertController.create({
          header: 'Error',
          message: errorMsg,
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  verDetalle(uso: UsoCamioneta) {
    this.usoDetalle = uso;
    this.vista = 'detalle';
  }

  async finalizarUso(uso: UsoCamioneta) {
    const alert = await this.alertController.create({
      header: 'Finalizar Uso',
      message:
        '¿Deseas finalizar el uso de la camioneta? Se registrará la hora de finalización.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Finalizar', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (role !== 'confirm') return;

    const loading = await this.loadingController.create({
      message: 'Finalizando...',
    });
    await loading.present();

    this.apiService.finalizarUsoCamioneta(uso.id).subscribe({
      next: async (res) => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Uso finalizado correctamente',
          duration: 3000,
          color: 'success',
        });
        await toast.present();

        if (this.vista === 'detalle' && res.data) {
          this.usoDetalle = res.data;
        }
        this.loadUsos();
      },
      error: async (err) => {
        await loading.dismiss();
        const errorAlert = await this.alertController.create({
          header: 'Error',
          message: err.error?.message || 'Error al finalizar',
          buttons: ['OK'],
        });
        await errorAlert.present();
      },
    });
  }

  getEstadoColor(estado: string): string {
    return estado === 'en_uso' ? 'warning' : 'success';
  }

  getEstadoLabel(estado: string): string {
    return estado === 'en_uso' ? 'EN USO' : 'FINALIZADO';
  }

  esPropietario(uso: UsoCamioneta): boolean {
    const userId = this.permisos.getCurrentUserId();
    return uso.user_id === userId;
  }

  getFotoUrl(foto: string): string {
    return this.storageBaseUrl + foto;
  }

  verFoto(foto: string) {
    this.fotoAmpliadaUrl = this.getFotoUrl(foto);
  }

  cerrarFoto() {
    this.fotoAmpliadaUrl = null;
  }
}

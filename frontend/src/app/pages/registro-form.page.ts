import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  ApiService,
  Cliente,
  Chofer,
  Placa,
  DescripcionJaba,
  RepresentanteCliente,
} from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  saveOutline,
  closeOutline,
  createOutline,
} from 'ionicons/icons';
import { ModalController } from '@ionic/angular/standalone';
import { FirmaPadComponent } from '../components/firma-pad.component';

@Component({
  selector: 'app-registro-form',
  templateUrl: './registro-form.page.html',
  styleUrls: ['./registro-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSpinner,
  ],
  providers: [ModalController],
})
export class RegistroFormPage implements OnInit {
  registroForm!: FormGroup;

  clientes: Cliente[] = [];
  choferes: Chofer[] = [];
  placas: Placa[] = [];
  descripcionesJabas: DescripcionJaba[] = [];
  representantesCliente: RepresentanteCliente[] = [];

  imagenCapturada: string | null = null;
  firmaEntregado: string | null = null;
  firmaRepresentante: string | null = null;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ cameraOutline, saveOutline, closeOutline, createOutline });
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.registroForm = this.fb.group({
      cliente_id: ['', Validators.required],
      representante_cliente_id: ['', Validators.required],
      chofer_id: ['', Validators.required],
      placa_1_id: ['', Validators.required],
      placa_2_id: [''],
      descripcion_jaba_1_id: ['', Validators.required],
      descripcion_jaba_2_id: [''],
      cantidad_jabas_1: [0, [Validators.required, Validators.min(1)]],
      cantidad_jabas_2: [0, Validators.min(0)],
      cantidad_parihuelas: [0, [Validators.required, Validators.min(0)]],
      observaciones: [''],
    });

    // Cuando cambia el cliente, cargar sus representantes y choferes
    this.registroForm
      .get('cliente_id')
      ?.valueChanges.subscribe(async (clienteId) => {
        if (clienteId) {
          await Promise.all([
            this.cargarRepresentantesCliente(clienteId),
            this.cargarChoferesCliente(clienteId),
            this.cargarDescripcionesCliente(clienteId),
          ]);

          // Buscar cliente seleccionado y preseleccionar representante activo
          const cliente = this.clientes.find((c) => c.id === clienteId);
          if (cliente?.representante_activo) {
            this.registroForm.patchValue({
              representante_cliente_id: cliente.representante_activo.id,
            });
          } else {
            this.registroForm.patchValue({ representante_cliente_id: '' });
          }

          // Limpiar selección de chofer y placas
          this.registroForm.patchValue({
            chofer_id: '',
            placa_1_id: '',
            placa_2_id: '',
          });
        } else {
          this.representantesCliente = [];
          this.choferes = [];
          this.placas = [];
          this.descripcionesJabas = [];
          this.registroForm.patchValue({
            representante_cliente_id: '',
            chofer_id: '',
            placa_1_id: '',
            placa_2_id: '',
          });
        }
      });

    // Cuando cambia el chofer, auto-seleccionar su placa principal
    this.registroForm.get('chofer_id')?.valueChanges.subscribe((choferId) => {
      if (choferId) {
        const chofer = this.choferes.find((c) => c.id === choferId);
        if (chofer?.placa_principal_id) {
          this.registroForm.patchValue({
            placa_1_id: chofer.placa_principal_id,
          });
        }
      }
    });
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
    });
    await loading.present();

    try {
      // Cargar todas las opciones para los dropdowns
      const clientesRes = await this.apiService
        .getClientesActivos()
        .toPromise();
      this.clientes = clientesRes?.data || [];

      // No cargar todos los choferes y placas inicialmente
      // Se cargarán cuando se seleccione un cliente
      // Tampoco cargar todas las descripciones
      // this.descripcionesJabas = [];
    } catch (error) {
      console.error('Error loading data:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar los datos',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async cargarRepresentantesCliente(clienteId: number) {
    try {
      const response = await this.apiService
        .getRepresentantesClientes(clienteId)
        .toPromise();
      this.representantesCliente = response?.data || [];
    } catch (error) {
      console.error('Error al cargar representantes:', error);
      this.representantesCliente = [];
    }
  }

  async cargarChoferesCliente(clienteId: number) {
    try {
      const response = await this.apiService
        .getChoferesActivos(clienteId)
        .toPromise();
      this.choferes = response?.data || [];

      // Cargar las placas de los choferes del cliente
      await this.cargarPlacasDeChoferes();
    } catch (error) {
      console.error('Error al cargar choferes:', error);
      this.choferes = [];
      this.placas = [];
    }
  }

  async cargarPlacasDeChoferes() {
    try {
      // Obtener todas las placas activas
      const response = await this.apiService.getPlacasActivas().toPromise();
      const todasLasPlacas = response?.data || [];

      // Obtener los IDs de las placas principales de los choferes del cliente
      const placasIdsDeChoferes = this.choferes
        .filter((chofer) => chofer.placa_principal_id)
        .map((chofer) => chofer.placa_principal_id);

      // Filtrar solo las placas que pertenecen a los choferes del cliente
      this.placas = todasLasPlacas.filter((placa) =>
        placasIdsDeChoferes.includes(placa.id)
      );
    } catch (error) {
      console.error('Error al cargar placas:', error);
      this.placas = [];
    }
  }

  async cargarDescripcionesCliente(clienteId: number) {
    try {
      const response = await this.apiService
        .getDescripcionesJabasActivasPorCliente(clienteId)
        .toPromise();
      this.descripcionesJabas = response?.data || [];
    } catch (error) {
      console.error('Error al cargar descripciones:', error);
      this.descripcionesJabas = [];
    }
  }

  async capturarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      this.imagenCapturada = image.dataUrl || null;
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, complete todos los campos requeridos',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    // Validar que las firmas sean obligatorias
    if (!this.firmaEntregado || !this.firmaRepresentante) {
      const toast = await this.toastCtrl.create({
        message:
          'Las firmas del Entregado y del Representante son obligatorias',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¿Guardar Registro?',
      message: 'Se creará un nuevo registro de alquiler. ¿Desea continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.guardarRegistro();
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirFirmaEntregado() {
    const modal = await this.modalCtrl.create({
      component: FirmaPadComponent,
      cssClass: 'firma-modal',
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.firmaEntregado = result.data;
      }
    });

    await modal.present();

    // Escuchar eventos del componente
    const { data } = await modal.onWillDismiss();
  }

  async abrirFirmaRepresentante() {
    const modal = await this.modalCtrl.create({
      component: FirmaPadComponent,
      cssClass: 'firma-modal',
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.firmaRepresentante = result.data;
      }
    });

    await modal.present();
  }

  async guardarRegistro() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando registro...',
    });
    await loading.present();

    try {
      const formData = new FormData();

      // Obtener user_id del usuario autenticado
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Agregar campos del formulario
      Object.keys(this.registroForm.value).forEach((key) => {
        const value = this.registroForm.value[key];
        if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // Agregar user_id
      console.log('Current user ID:', currentUser.id);
      formData.append('user_id', currentUser.id.toString());

      // Agregar imagen si existe
      if (this.imagenCapturada) {
        const blob = await this.dataUrlToBlob(this.imagenCapturada);
        formData.append('imagen', blob, 'registro.jpg');
      }

      // Agregar firmas
      if (this.firmaEntregado) {
        formData.append('firma_entregado', this.firmaEntregado);
      }

      if (this.firmaRepresentante) {
        formData.append('firma_representante', this.firmaRepresentante);
      }

      const response = await this.apiService
        .createRegistro(formData)
        .toPromise();

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Registro creado exitosamente',
        duration: 3000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/registros']);
    } catch (error: any) {
      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: error.error?.message || 'Error al guardar el registro',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}

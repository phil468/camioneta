import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ApiService,
  Cliente,
  RepresentanteCliente,
} from '../../services/api.service';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonText,
  IonTextarea,
  IonCheckbox,
  IonBadge,
  IonList,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.page.html',
  styleUrls: ['./cliente-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonText,
    IonTextarea,
    IonCheckbox,
    IonBadge,
    IonList,
  ],
})
export class ClienteFormPage implements OnInit {
  clienteForm: FormGroup;
  clienteId: number | null = null;
  isEditMode = false;
  loading = false;
  representantes: RepresentanteCliente[] = [];
  mostrarFormRepresentante = false;
  representanteEditandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {
    this.clienteForm = this.fb.group({
      codigo: ['', [Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      ruc: ['', [Validators.pattern(/^\d{11}$/)]],
      direccion: ['', [Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      activo: [true],
      // Formulario temporal para representante
      representante_nombre: [''],
      representante_dni: ['', [Validators.pattern(/^\d{8}$/)]],
      representante_telefono: [''],
      representante_email: ['', [Validators.email]],
      representante_cargo: [''],
      representante_activo: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = parseInt(id);
      this.isEditMode = true;
      this.cargarCliente();
    }
  }

  async cargarCliente() {
    if (!this.clienteId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getCliente(this.clienteId)
        .toPromise();
      if (response?.data) {
        this.clienteForm.patchValue(response.data);
        // Cargar representantes del cliente
        await this.cargarRepresentantes();
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      this.mostrarError('Error al cargar los datos del cliente');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.clienteForm.invalid) {
      Object.keys(this.clienteForm.controls).forEach((key) => {
        this.clienteForm.get(key)?.markAsTouched();
      });
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } este cliente?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarCliente();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarCliente() {
    this.loading = true;
    try {
      const data = this.clienteForm.value;

      if (this.isEditMode && this.clienteId) {
        await this.apiService.updateCliente(this.clienteId, data).toPromise();
      } else {
        await this.apiService.createCliente(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Cliente ${
          this.isEditMode ? 'actualizado' : 'creado'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      let mensaje = 'Error al guardar el cliente';

      if (error?.error?.message) {
        mensaje = error.error.message;
      }

      this.mostrarError(mensaje);
    } finally {
      this.loading = false;
    }
  }

  async cancelar() {
    if (this.clienteForm.dirty) {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Deseas descartar los cambios?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: () => {
              this.volver();
            },
          },
        ],
      });

      await alert.present();
    } else {
      this.volver();
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
    this.router.navigate(['/clientes']);
  }

  getErrorMessage(field: string): string {
    const control = this.clienteForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['pattern']) {
      if (field === 'ruc') return 'RUC debe tener 11 dígitos';
      if (field === 'representante_dni') return 'DNI debe tener 8 dígitos';
      return 'Formato inválido';
    }
    if (control.errors['maxLength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }

  // ========== REPRESENTANTES ==========
  async cargarRepresentantes() {
    if (!this.clienteId) return;

    try {
      const response = await this.apiService
        .getRepresentantesClientes(this.clienteId)
        .toPromise();
      if (response?.data) {
        this.representantes = response.data;
      }
    } catch (error) {
      console.error('Error al cargar representantes:', error);
    }
  }

  async mostrarAgregarRepresentante() {
    // Si es un cliente nuevo, primero lo guardamos
    if (!this.clienteId) {
      const alert = await this.alertController.create({
        header: 'Guardar Cliente',
        message:
          'Para agregar un representante primero debes guardar el cliente. ¿Deseas guardarlo ahora?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Guardar',
            handler: async () => {
              await this.guardarClienteYAbrirRepresentante();
            },
          },
        ],
      });

      await alert.present();
      return;
    }

    // Si ya tiene ID, mostramos el formulario directamente
    this.mostrarFormRepresentante = true;
    this.representanteEditandoId = null;
    this.clienteForm.patchValue({
      representante_nombre: '',
      representante_dni: '',
      representante_telefono: '',
      representante_email: '',
      representante_cargo: '',
      representante_activo: true,
    });
  }

  async guardarClienteYAbrirRepresentante() {
    if (this.clienteForm.invalid) {
      Object.keys(this.clienteForm.controls).forEach((key) => {
        this.clienteForm.get(key)?.markAsTouched();
      });
      this.mostrarError(
        'Por favor completa los campos obligatorios del cliente',
      );
      return;
    }

    this.loading = true;
    try {
      const data = this.clienteForm.value;
      const response = await this.apiService.createCliente(data).toPromise();

      if (response?.data) {
        // Actualizamos el ID del cliente
        this.clienteId = response.data.id;
        this.isEditMode = true;

        // Mostramos el formulario de representante
        this.mostrarFormRepresentante = true;
        this.representanteEditandoId = null;
        this.clienteForm.patchValue({
          representante_nombre: '',
          representante_dni: '',
          representante_telefono: '',
          representante_email: '',
          representante_cargo: '',
          representante_activo: true,
        });
      }
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      let mensaje = 'Error al guardar el cliente';

      if (error?.error?.message) {
        mensaje = error.error.message;
      }

      this.mostrarError(mensaje);
    } finally {
      this.loading = false;
    }
  }

  editarRepresentante(representante: RepresentanteCliente) {
    this.mostrarFormRepresentante = true;
    this.representanteEditandoId = representante.id;
    this.clienteForm.patchValue({
      representante_nombre: representante.nombre,
      representante_dni: representante.dni,
      representante_telefono: representante.telefono,
      representante_email: representante.email,
      representante_cargo: representante.cargo,
      representante_activo: representante.activo,
    });
  }

  cancelarRepresentante() {
    this.mostrarFormRepresentante = false;
    this.representanteEditandoId = null;
  }

  async guardarRepresentante() {
    if (!this.clienteId) {
      this.mostrarError('Primero debes guardar el cliente');
      return;
    }

    const nombre = this.clienteForm.get('representante_nombre')?.value;
    if (!nombre || nombre.trim() === '') {
      this.mostrarError('El nombre del representante es obligatorio');
      return;
    }

    const data: Partial<RepresentanteCliente> = {
      cliente_id: this.clienteId,
      nombre: this.clienteForm.get('representante_nombre')?.value,
      dni: this.clienteForm.get('representante_dni')?.value,
      telefono: this.clienteForm.get('representante_telefono')?.value,
      email: this.clienteForm.get('representante_email')?.value,
      cargo: this.clienteForm.get('representante_cargo')?.value,
      activo: this.clienteForm.get('representante_activo')?.value,
    };

    try {
      if (this.representanteEditandoId) {
        await this.apiService
          .updateRepresentanteCliente(this.representanteEditandoId, data)
          .toPromise();
      } else {
        await this.apiService.createRepresentanteCliente(data).toPromise();
      }

      await this.cargarRepresentantes();
      this.cancelarRepresentante();
    } catch (error) {
      console.error('Error al guardar representante:', error);
      this.mostrarError('Error al guardar el representante');
    }
  }

  async eliminarRepresentante(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas eliminar este representante?',
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
              await this.apiService.deleteRepresentanteCliente(id).toPromise();
              await this.cargarRepresentantes();
            } catch (error) {
              console.error('Error al eliminar representante:', error);
              this.mostrarError('Error al eliminar el representante');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async activarRepresentante(id: number) {
    try {
      await this.apiService.activarRepresentanteCliente(id).toPromise();
      await this.cargarRepresentantes();
    } catch (error) {
      console.error('Error al activar representante:', error);
      this.mostrarError('Error al activar el representante');
    }
  }
}

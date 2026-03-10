import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Chofer, Cliente, Placa } from '../../services/api.service';
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
  IonSelect,
  IonSelectOption,
  IonText,
  IonInput,
  IonNote,
  IonCheckbox,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-chofer-form',
  templateUrl: './chofer-form.page.html',
  styleUrls: ['./chofer-form.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonText,
    IonInput,
    IonNote,
    IonCheckbox,
  ],
})
export class ChoferFormPage implements OnInit {
  choferForm: FormGroup;
  choferId: number | null = null;
  isEditMode = false;
  loading = false;
  clientes: Cliente[] = [];
  placas: Placa[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {
    this.choferForm = this.fb.group({
      cliente_id: [''],
      placa_principal_id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      licencia: ['', [Validators.maxLength(20)]],
      telefono: ['', [Validators.maxLength(20)]],
      activo: [true],
    });
  }

  ngOnInit() {
    this.loadData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.choferId = parseInt(id);
      this.isEditMode = true;
      this.cargarChofer();
    }
  }

  async loadData() {
    try {
      const clientesRes = await this.apiService
        .getClientesActivos()
        .toPromise();
      this.clientes = clientesRes?.data || [];

      const placasRes = await this.apiService.getPlacasActivas().toPromise();
      this.placas = placasRes?.data || [];
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  async cargarChofer() {
    if (!this.choferId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getChofer(this.choferId)
        .toPromise();
      if (response?.data) {
        this.choferForm.patchValue(response.data);
      }
    } catch (error) {
      console.error('Error al cargar chofer:', error);
      this.mostrarError('Error al cargar los datos del chofer');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.choferForm.invalid) {
      Object.keys(this.choferForm.controls).forEach((key) => {
        this.choferForm.get(key)?.markAsTouched();
      });

      // Construir mensaje resumen de los errores del formulario
      const mensajes: string[] = [];
      Object.keys(this.choferForm.controls).forEach((key) => {
        const msg = this.getErrorMessage(key);
        if (msg) mensajes.push(msg);
      });

      const alert = await this.alertController.create({
        header: 'Errores de validación',
        message: mensajes.length
          ? mensajes.join('<br>')
          : 'Complete los campos obligatorios.',
        buttons: ['OK'],
      });
      await alert.present();

      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } este chofer?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarChofer();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarChofer() {
    this.loading = true;
    try {
      const data = this.choferForm.value;

      if (this.isEditMode && this.choferId) {
        await this.apiService.updateChofer(this.choferId, data).toPromise();
      } else {
        await this.apiService.createChofer(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Chofer ${
          this.isEditMode ? 'actualizado' : 'creado'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar chofer:', error);

      // Si Laravel devuelve errores de validación (422), mostrar cada mensaje al usuario
      if (error?.status === 422 && error?.error?.errors) {
        const errs = error.error.errors;
        const mensajes: string[] = [];
        Object.values(errs).forEach((v: any) => {
          if (Array.isArray(v)) {
            v.forEach((m) => mensajes.push(m));
          } else if (typeof v === 'string') {
            mensajes.push(v);
          }
        });

        const alert = await this.alertController.create({
          header: 'Errores de validación',
          // mostrar cada error en nueva línea (Ionic Alert acepta HTML simple)
          message: mensajes.join('<br>'),
          buttons: ['OK'],
        });
        await alert.present();
      } else {
        let mensaje = 'Error al guardar el chofer';
        if (error?.error?.message) {
          mensaje = error.error.message;
        }
        this.mostrarError(mensaje);
      }
    } finally {
      this.loading = false;
    }
  }

  async cancelar() {
    if (this.choferForm.dirty) {
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
    this.router.navigate(['/choferes']);
  }

  getErrorMessage(field: string): string {
    const control = this.choferForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['pattern']) {
      return 'DNI debe tener 8 dígitos';
    }
    if (control.errors['maxLength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.choferForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Placa } from '../../services/api.service';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-placa-form',
  templateUrl: './placa-form.page.html',
  styleUrls: ['./placa-form.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonSpinner,
  ],
})
export class PlacaFormPage implements OnInit {
  placaForm: FormGroup;
  placaId: number | null = null;
  isEditMode = false;
  loading = false;

  tiposVehiculo = ['Camión', 'Furgoneta', 'Camioneta', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {
    this.placaForm = this.fb.group({
      numero_placa: ['', [Validators.required, Validators.maxLength(10)]],
      tipo_vehiculo: [''],
      marca: ['', [Validators.maxLength(50)]],
      modelo: ['', [Validators.maxLength(50)]],
      anio: [''],
      activo: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.placaId = parseInt(id);
      this.isEditMode = true;
      this.cargarPlaca();
    }
  }

  async cargarPlaca() {
    if (!this.placaId) return;

    this.loading = true;
    try {
      const response = await this.apiService.getPlaca(this.placaId).toPromise();
      if (response?.data) {
        this.placaForm.patchValue(response.data);
      }
    } catch (error) {
      console.error('Error al cargar placa:', error);
      this.mostrarError('Error al cargar los datos de la placa');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.placaForm.invalid) {
      Object.keys(this.placaForm.controls).forEach((key) => {
        this.placaForm.get(key)?.markAsTouched();
      });
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } esta placa?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarPlaca();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarPlaca() {
    this.loading = true;
    try {
      const data = this.placaForm.value;

      if (this.isEditMode && this.placaId) {
        await this.apiService.updatePlaca(this.placaId, data).toPromise();
      } else {
        await this.apiService.createPlaca(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Placa ${
          this.isEditMode ? 'actualizada' : 'creada'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar placa:', error);
      let mensaje = 'Error al guardar la placa';

      if (error?.error?.message) {
        mensaje = error.error.message;
      }

      this.mostrarError(mensaje);
    } finally {
      this.loading = false;
    }
  }

  async cancelar() {
    if (this.placaForm.dirty) {
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
    this.router.navigate(['/placas']);
  }

  getErrorMessage(field: string): string {
    const control = this.placaForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['maxLength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }
}

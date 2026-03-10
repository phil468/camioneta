import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, DescripcionJaba } from '../../services/api.service';
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonNote,
  IonTextarea,
  IonCheckbox,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-descripcion-form',
  templateUrl: './descripcion-form.page.html',
  styleUrls: ['./descripcion-form.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonNote,
    IonTextarea,
    IonCheckbox,
    IonSpinner,
  ],
})
export class DescripcionFormPage implements OnInit {
  descripcionForm: FormGroup;
  descripcionId: number | null = null;
  isEditMode = false;
  loading = false;

  clientes: any[] = [];

  colores = [
    'Azul',
    'Rojo',
    'Verde',
    'Amarillo',
    'Negro',
    'Blanco',
    'Naranja',
    'Gris',
    'Otro',
  ];
  materiales = ['Plástico', 'Madera', 'Metal', 'Cartón', 'Otro'];

  // Etiquetas legibles para los campos (para mostrar en mensajes)
  fieldLabels: Record<string, string> = {
    cliente_id: 'Cliente',
    codigo: 'Código',
    descripcion: 'Descripción',
    color: 'Color',
    material: 'Material',
    capacidad: 'Capacidad',
    activo: 'Activo',
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {
    this.descripcionForm = this.fb.group({
      cliente_id: [null, [Validators.required]],
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      color: [''],
      material: [''],
      capacidad: [''],
      activo: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadClientes();
    if (id) {
      this.descripcionId = parseInt(id);
      this.isEditMode = true;
      this.cargarDescripcion();
    }
  }

  // Ionic page lifecycle: se ejecuta cada vez que la vista entra en pantalla
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      // Reiniciar el formulario para nuevo registro (evita valores previos al navegar)
      this.descripcionForm.reset({
        cliente_id: null,
        codigo: '',
        descripcion: '',
        color: '',
        material: '',
        capacidad: '',
        activo: true,
      });
      this.isEditMode = false;
      this.descripcionId = null;
    }
    // Asegurar que la lista de clientes está actualizada
    this.loadClientes();
  }

  async loadClientes() {
    try {
      const res = await this.apiService.getClientesActivos().toPromise();
      this.clientes = res?.data || [];
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  async cargarDescripcion() {
    if (!this.descripcionId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getDescripcionJaba(this.descripcionId)
        .toPromise();
      if (response?.data) {
        this.descripcionForm.patchValue(response.data);
      }
    } catch (error) {
      console.error('Error al cargar descripción:', error);
      this.mostrarError('Error al cargar los datos de la descripción');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.descripcionForm.invalid) {
      Object.keys(this.descripcionForm.controls).forEach((key) => {
        this.descripcionForm.get(key)?.markAsTouched();
      });

      // Mostrar resumen de errores al usuario con etiquetas de campo
      const mensajes: string[] = [];
      Object.keys(this.descripcionForm.controls).forEach((key) => {
        const msg = this.getErrorMessage(key);
        if (msg) {
          const label = this.fieldLabels[key] || key;
          mensajes.push(`${label}: ${msg}`);
        }
      });

      const html = mensajes.length
        ? `<ul>${mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>`
        : 'Complete los campos obligatorios.';

      const alert = await this.alertController.create({
        header: 'Errores de validación',
        message: html,
        buttons: ['OK'],
      });
      await alert.present();

      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } esta descripción?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarDescripcion();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarDescripcion() {
    this.loading = true;
    try {
      const data = this.descripcionForm.value;

      if (this.isEditMode && this.descripcionId) {
        await this.apiService
          .updateDescripcionJaba(this.descripcionId, data)
          .toPromise();
      } else {
        await this.apiService.createDescripcionJaba(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Descripción ${
          this.isEditMode ? 'actualizada' : 'creada'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar descripción:', error);

      // Manejar errores de validación retornados por el backend (422)
      if (error?.status === 422 && error?.error?.errors) {
        const errs = error.error.errors;
        const mensajes: string[] = [];
        Object.keys(errs).forEach((field) => {
          const label = this.fieldLabels[field] || field;
          const arr = errs[field];
          if (Array.isArray(arr)) {
            arr.forEach((m: string) => mensajes.push(`${label}: ${m}`));
          }

          // marcar el control asociado como tocado para que se muestre inline
          const control = this.descripcionForm.get(field);
          if (control) control.markAsTouched();
        });

        const html = `<ul>${mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>`;
        const alert = await this.alertController.create({
          header: 'Errores de validación',
          message: html,
          buttons: ['OK'],
        });
        await alert.present();
      } else {
        let mensaje = 'Error al guardar la descripción';
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
    if (this.descripcionForm.dirty) {
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
    this.router.navigate(['/descripciones']);
  }

  getErrorMessage(field: string): string {
    const control = this.descripcionForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['maxLength'] || control.errors['maxlength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.descripcionForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}

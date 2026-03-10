import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Usuario, Role } from '../../services/api.service';
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
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.page.html',
  styleUrls: ['./usuario-form.page.scss'],
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
  ],
})
export class UsuarioFormPage implements OnInit {
  usuarioForm!: FormGroup;
  isEditMode = false;
  usuarioId?: number;
  loading = false;
  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.cargarRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.usuarioId = parseInt(id);
      // Actualizar validaciones para modo edición
      // Si el usuario escribe algo, debe tener al menos 6 caracteres
      this.usuarioForm
        .get('password')
        ?.setValidators([Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
      this.cargarUsuario();
    }
  }

  async cargarRoles() {
    try {
      const response = await this.apiService.getRoles().toPromise();
      this.roles = response?.data || [];
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
      ],
      activo: [true],
      role_id: ['', Validators.required],
    });
  }

  async cargarUsuario() {
    if (!this.usuarioId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getUsuario(this.usuarioId)
        .toPromise();
      const usuario = response?.data;

      if (usuario) {
        this.usuarioForm.patchValue({
          name: usuario.name,
          email: usuario.email,
          activo: usuario.activo,
          role_id: usuario.role_id,
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo cargar el usuario',
        buttons: ['OK'],
      });
      await alert.present();
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.usuarioForm.invalid) {
      Object.keys(this.usuarioForm.controls).forEach((key) => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    try {
      const formData = this.usuarioForm.value;

      // Si estamos editando y no se cambió el password, no enviarlo
      if (this.isEditMode && !formData.password) {
        delete formData.password;
      }

      if (this.isEditMode && this.usuarioId) {
        await this.apiService
          .updateUsuario(this.usuarioId, formData)
          .toPromise();
      } else {
        await this.apiService.createUsuario(formData).toPromise();
      }

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: this.isEditMode
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
        buttons: ['OK'],
      });
      await alert.present();

      this.volver();
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: error.error?.message || 'Error al guardar el usuario',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.loading = false;
    }
  }

  volver() {
    this.router.navigate(['/usuarios']);
  }

  getErrorMessage(field: string): string {
    const control = this.usuarioForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }
}

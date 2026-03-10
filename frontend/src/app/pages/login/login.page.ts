import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AlertController,
  LoadingController,
  MenuController,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudDownloadOutline, logoMicrosoft } from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
  ],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  showRegister = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private menuCtrl: MenuController,
  ) {
    // Registrar iconos
    addIcons({ cloudDownloadOutline, logoMicrosoft });

    // Deshabilitar menú inmediatamente
    this.menuCtrl.enable(false);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir al home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }

    // Verificar si hay un error en la URL
    this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.mostrarError(decodeURIComponent(params['error']));
        // Limpiar el parámetro de la URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  ionViewWillEnter() {
    // Deshabilitar el menú lateral en la página de login
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    // Habilitar el menú lateral al salir de la página de login
    this.menuCtrl.enable(true);
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error de Acceso',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async login() {
    console.log('login(): invoked', {
      valid: this.loginForm.valid,
      value: this.loginForm.value,
      emailErrors: this.loginForm.get('email')?.errors,
      passwordErrors: this.loginForm.get('password')?.errors,
      emailValue: this.loginForm.get('email')?.value,
      passwordValue: this.loginForm.get('password')?.value,
    });

    if (this.loginForm.invalid) {
      console.log(
        'login(): form is invalid; controls:',
        this.loginForm.controls,
      );
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });

      // Mostrar resumen de errores para que el usuario sepa por qué no se envía
      const mensajes: string[] = [];
      Object.keys(this.loginForm.controls).forEach((key) => {
        const msg = this.getErrorMessage(this.loginForm, key);
        if (msg)
          mensajes.push(`${key === 'email' ? 'Email' : 'Contraseña'}: ${msg}`);
      });

      console.log('login(): validation messages:', mensajes);

      const alert = await this.alertController.create({
        header: 'Errores de validación',
        message: mensajes.length
          ? `<ul>${mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>`
          : 'Complete los campos obligatorios.',
        buttons: ['OK'],
      });
      await alert.present();

      return;
    }

    console.log('login(): form valid, preparing to call auth service');

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    const { email, password } = this.loginForm.value;

    console.log('login(): submitting credentials for', email);

    this.authService.login(email, password).subscribe({
      next: async (response) => {
        console.log('login(): auth success response', response);
        await loading.dismiss();
        if (response.success) {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      },
      error: async (error) => {
        console.error('login(): auth error', error);
        await loading.dismiss();
        this.mostrarError(error.error?.message || 'Error al iniciar sesión');
      },
    });
  }

  async register() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { password, password_confirmation } = this.registerForm.value;
    if (password !== password_confirmation) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
    });
    await loading.present();

    const { name, email } = this.registerForm.value;

    this.authService
      .register(name, email, password, password_confirmation)
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          if (response.success) {
            this.router.navigate(['/home'], { replaceUrl: true });
          }
        },
        error: async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.error?.message || 'Error al crear la cuenta',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
  }

  loginWithMicrosoft() {
    console.log(
      'loginWithMicrosoft(): clicked, redirecting to Microsoft OAuth',
    );
    this.authService.loginWithMicrosoft();
  }

  toggleForm() {
    this.showRegister = !this.showRegister;
    this.loginForm.reset();
    this.registerForm.reset();
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }

    return '';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonSpinner,
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { ApiService, Camioneta } from '../../services/api.service';

@Component({
  selector: 'app-camioneta-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/camionetas"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Editar' : 'Nueva' }} Camioneta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="loadingData" class="ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      <div *ngIf="!loadingData">
        <ion-item>
          <ion-label position="stacked">Nombre *</ion-label>
          <ion-input
            [(ngModel)]="camioneta.nombre"
            placeholder="Ej: Camioneta 1"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Placa</ion-label>
          <ion-input
            [(ngModel)]="camioneta.placa"
            placeholder="Ej: ABC-123"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Marca</ion-label>
          <ion-input
            [(ngModel)]="camioneta.marca"
            placeholder="Ej: Toyota"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Modelo</ion-label>
          <ion-input
            [(ngModel)]="camioneta.modelo"
            placeholder="Ej: Hilux"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Año</ion-label>
          <ion-input
            [(ngModel)]="camioneta.anio"
            type="number"
            placeholder="Ej: 2024"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Color</ion-label>
          <ion-input
            [(ngModel)]="camioneta.color"
            placeholder="Ej: Blanco"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-toggle [(ngModel)]="camioneta.activo">Activo</ion-toggle>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" (click)="guardar()">
          <ion-icon name="save-outline" slot="start"></ion-icon>
          Guardar
        </ion-button>
      </div>
    </ion-content>
  `,
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
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonSpinner,
  ],
})
export class CamionetaFormPage implements OnInit {
  isEdit = false;
  loadingData = false;
  camioneta: Partial<Camioneta> = { nombre: '', activo: true };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
    addIcons({ saveOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadingData = true;
      this.apiService.getCamioneta(+id).subscribe({
        next: (res) => {
          this.camioneta = res.data || {};
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
        },
      });
    }
  }

  async guardar() {
    if (!this.camioneta.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre es obligatorio',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    const obs = this.isEdit
      ? this.apiService.updateCamioneta(this.camioneta.id!, this.camioneta)
      : this.apiService.createCamioneta(this.camioneta);

    obs.subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Guardado correctamente',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/camionetas']);
      },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: err.error?.message || 'Error al guardar',
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }
}

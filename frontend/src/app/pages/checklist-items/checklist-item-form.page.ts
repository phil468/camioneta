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
  IonTextarea,
  IonToggle,
  IonSpinner,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { ApiService, ChecklistItem } from '../../services/api.service';

@Component({
  selector: 'app-checklist-item-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/checklist-items"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Item</ion-title>
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
            [(ngModel)]="item.nombre"
            placeholder="Ej: Luces delanteras"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-textarea
            [(ngModel)]="item.descripcion"
            placeholder="Descripción opcional"
          ></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Orden</ion-label>
          <ion-input
            [(ngModel)]="item.orden"
            type="number"
            placeholder="0"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-toggle [(ngModel)]="item.activo">Activo</ion-toggle>
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
    IonTextarea,
    IonToggle,
    IonSpinner,
  ],
})
export class ChecklistItemFormPage implements OnInit {
  isEdit = false;
  loadingData = false;
  item: Partial<ChecklistItem> = { nombre: '', orden: 0, activo: true };

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
      this.apiService.getChecklistItem(+id).subscribe({
        next: (res) => {
          this.item = res.data || {};
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
        },
      });
    }
  }

  async guardar() {
    if (!this.item.nombre) {
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
      ? this.apiService.updateChecklistItem(this.item.id!, this.item)
      : this.apiService.createChecklistItem(this.item);

    obs.subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Guardado correctamente',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/checklist-items']);
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

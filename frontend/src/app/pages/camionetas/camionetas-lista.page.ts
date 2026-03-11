import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { ApiService, Camioneta } from '../../services/api.service';

@Component({
  selector: 'app-camionetas-lista',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/configuracion"></ion-back-button>
        </ion-buttons>
        <ion-title>Camionetas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="navegarA('/camionetas/nuevo')">
            <ion-icon name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>
      <ion-list *ngIf="!loading">
        <ion-item
          *ngFor="let c of camionetas"
          button
          (click)="navegarA('/camionetas/editar/' + c.id)"
        >
          <ion-label>
            <h2>{{ c.nombre }}</h2>
            <p>{{ c.placa }} {{ c.marca }} {{ c.modelo }}</p>
          </ion-label>
          <ion-badge slot="end" [color]="c.activo ? 'success' : 'danger'">
            {{ c.activo ? 'Activo' : 'Inactivo' }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
  ],
})
export class CamionetasListaPage implements OnInit {
  camionetas: Camioneta[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
    addIcons({ addOutline, createOutline, trashOutline });
  }

  ngOnInit() {
    this.cargar();
  }

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.apiService.getCamionetas().subscribe({
      next: (res) => {
        this.camionetas = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}

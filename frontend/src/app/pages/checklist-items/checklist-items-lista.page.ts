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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { ApiService, ChecklistItem } from '../../services/api.service';

@Component({
  selector: 'app-checklist-items-lista',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/configuracion"></ion-back-button>
        </ion-buttons>
        <ion-title>Items de Checklist</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="navegarA('/checklist-items/nuevo')">
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
          *ngFor="let item of items"
          button
          (click)="navegarA('/checklist-items/editar/' + item.id)"
        >
          <ion-label>
            <h2>{{ item.nombre }}</h2>
            <p *ngIf="item.descripcion">{{ item.descripcion }}</p>
            <p>Orden: {{ item.orden }}</p>
          </ion-label>
          <ion-badge slot="end" [color]="item.activo ? 'success' : 'danger'">
            {{ item.activo ? 'Activo' : 'Inactivo' }}
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
export class ChecklistItemsListaPage implements OnInit {
  items: ChecklistItem[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
    addIcons({ addOutline });
  }

  ngOnInit() {
    this.cargar();
  }
  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.apiService.getChecklistItems().subscribe({
      next: (res) => {
        this.items = res.data || [];
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

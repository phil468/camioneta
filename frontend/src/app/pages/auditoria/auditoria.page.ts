import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, refreshOutline } from 'ionicons/icons';
import { ApiService, Audit } from '../../services/api.service';

@Component({
  selector: 'app-auditoria',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/configuracion"></ion-back-button>
        </ion-buttons>
        <ion-title>Auditoría</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cargar()">
            <ion-icon name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Filtros -->
      <ion-item>
        <ion-label position="stacked">Tipo</ion-label>
        <ion-select
          [(ngModel)]="filtroTipo"
          (ionChange)="cargar()"
          placeholder="Todos"
        >
          <ion-select-option value="">Todos</ion-select-option>
          <ion-select-option value="App\\Models\\Reserva"
            >Reservas</ion-select-option
          >
          <ion-select-option value="App\\Models\\UsoCamioneta"
            >Usos de Camioneta</ion-select-option
          >
        </ion-select>
      </ion-item>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <ion-list *ngIf="!loading">
        <ion-card *ngFor="let audit of audits" class="audit-card">
          <ion-card-header>
            <ion-card-title style="font-size: 14px;">
              <ion-badge [color]="getEventColor(audit.event)">{{
                audit.event
              }}</ion-badge>
              {{ getModelName(audit.auditable_type) }} #{{ audit.auditable_id }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Usuario:</strong> {{ audit.user?.name || 'Sistema' }}</p>
            <p>
              <strong>Fecha:</strong>
              {{ audit.created_at | date: 'dd/MM/yyyy HH:mm:ss' }}
            </p>
            <div *ngIf="audit.old_values">
              <p><strong>Valores anteriores:</strong></p>
              <pre style="font-size: 11px; overflow-x: auto;">{{
                audit.old_values | json
              }}</pre>
            </div>
            <div *ngIf="audit.new_values">
              <p><strong>Valores nuevos:</strong></p>
              <pre style="font-size: 11px; overflow-x: auto;">{{
                audit.new_values | json
              }}</pre>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div
        *ngIf="!loading && audits.length === 0"
        class="ion-text-center ion-padding"
      >
        <p>No hay registros de auditoría</p>
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
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class AuditoriaPage implements OnInit {
  audits: Audit[] = [];
  loading = false;
  filtroTipo = '';

  constructor(private apiService: ApiService) {
    addIcons({ filterOutline, refreshOutline });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    const filters: any = {};
    if (this.filtroTipo) {
      filters.auditable_type = this.filtroTipo;
    }

    this.apiService.getAuditorias(filters).subscribe({
      next: (res) => {
        this.audits = (res.data as any)?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getEventColor(event: string): string {
    switch (event) {
      case 'created':
        return 'success';
      case 'updated':
        return 'warning';
      case 'deleted':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getModelName(type: string): string {
    if (!type) return '';
    const parts = type.split('\\');
    return parts[parts.length - 1];
  }
}

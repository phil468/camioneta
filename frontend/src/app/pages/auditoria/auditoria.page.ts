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
import { forkJoin } from 'rxjs';

interface AuditRow {
  field: string;
  label: string;
  before: string;
  after: string;
}

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
            <ion-card-title
              style="font-size: 14px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;"
            >
              <ion-badge [color]="getEventColor(audit.event)">
                {{ getEventLabel(audit.event) }}
              </ion-badge>
              <span
                >{{ getModelName(audit.auditable_type) }} #{{
                  audit.auditable_id
                }}</span
              >
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p style="margin: 0 0 4px;">
              <strong>Usuario:</strong> {{ audit.user?.name || 'Sistema' }}
            </p>
            <p style="margin: 0 0 8px;">
              <strong>Fecha:</strong>
              {{ audit.created_at | date: 'dd/MM/yyyy HH:mm:ss' }}
            </p>
            <div *ngIf="getAuditRows(audit).length > 0">
              <p style="margin: 0 0 8px;"><strong>Detalles:</strong></p>
              <div
                class="audit-rows"
                style="display: flex; flex-direction: column; gap: 8px;"
              >
                <div class="audit-row" *ngFor="let row of getAuditRows(audit)">
                  <div
                    class="audit-field"
                    style="font-weight: 600; margin-bottom: 4px;"
                  >
                    {{ row.label }}
                  </div>
                  <div
                    class="audit-values"
                    [class.audit-values-update]="audit.event === 'updated'"
                    style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;"
                  >
                    <ng-container
                      *ngIf="audit.event === 'updated'; else singleValue"
                    >
                      <span
                        class="before"
                        *ngIf="row.before !== row.after"
                        style="padding: 4px 8px; border-radius: 999px; background: #f3f4f6; color: #6b7280;"
                      >
                        {{ row.before }}
                      </span>
                      <span
                        class="arrow"
                        *ngIf="row.before !== row.after"
                        style="color: #9ca3af;"
                        >→</span
                      >
                      <span
                        class="after"
                        style="padding: 4px 8px; border-radius: 999px; background: #e8f4ff; color: #1f4f82;"
                      >
                        {{ row.after }}
                      </span>
                    </ng-container>
                    <ng-template #singleValue>
                      <span
                        style="padding: 4px 8px; border-radius: 999px; background: #f3f4f6; color: #374151;"
                      >
                        {{ getSingleAuditValue(audit.event, row) }}
                      </span>
                    </ng-template>
                  </div>
                </div>
              </div>
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
  private usuariosMap = new Map<number, string>();
  private camionetasMap = new Map<number, string>();
  private reservasMap = new Map<number, string>();

  private readonly reservedKeys = [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
  ];
  private readonly fieldLabels: Record<string, Record<string, string>> = {
    'App\\Models\\Reserva': {
      user_id: 'Usuario',
      camioneta_id: 'Camioneta',
      fecha: 'Fecha',
      hora_inicio: 'Hora inicio',
      hora_fin: 'Hora fin',
      estado: 'Estado',
      notas: 'Notas',
    },
    'App\\Models\\UsoCamioneta': {
      user_id: 'Usuario',
      camioneta_id: 'Camioneta',
      reserva_id: 'Reserva asociada',
      hora_inicio: 'Hora inicio',
      hora_fin: 'Hora fin',
      estado: 'Estado',
      observaciones: 'Observaciones',
    },
  };

  constructor(private apiService: ApiService) {
    addIcons({ filterOutline, refreshOutline });
  }

  ngOnInit() {
    this.cargarReferencias();
  }

  private cargarReferencias() {
    this.loading = true;

    forkJoin({
      usuarios: this.apiService.getUsuarios(),
      camionetas: this.apiService.getCamionetas(),
      reservas: this.apiService.getReservas(),
    }).subscribe({
      next: ({ usuarios, camionetas, reservas }) => {
        this.usuariosMap = new Map(
          (usuarios.data || []).map((u) => [u.id, u.name]),
        );
        this.camionetasMap = new Map(
          (camionetas.data || []).map((c) => [
            c.id,
            `${c.nombre}${c.placa ? ` (${c.placa})` : ''}`,
          ]),
        );
        this.reservasMap = new Map(
          (reservas.data || []).map((r) => [
            r.id,
            `${this.getUserName(r.user_id)} - ${this.getCamionetaName(r.camioneta_id)} - ${this.formatFechaReserva(r.fecha)} ${this.formatHoraReserva(r.hora_inicio, r.hora_fin)}`,
          ]),
        );
        this.cargar();
      },
      error: () => {
        // Si falla la carga de catálogos, igual mostramos la auditoría con fallback a IDs.
        this.cargar();
      },
    });
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

  getEventLabel(event: string): string {
    switch (event) {
      case 'created':
        return 'creado';
      case 'updated':
        return 'actualizado';
      case 'deleted':
        return 'eliminado';
      default:
        return event;
    }
  }

  getModelName(type: string): string {
    if (!type) return '';
    const parts = type.split('\\');
    return parts[parts.length - 1];
  }

  getAuditRows(audit: Audit): AuditRow[] {
    const oldValues = this.normalizeValues(audit.old_values);
    const newValues = this.normalizeValues(audit.new_values);
    const keys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ]);

    return Array.from(keys)
      .filter((key) => !this.reservedKeys.includes(key))
      .map((key) => ({
        field: key,
        label: this.getFieldLabel(audit.auditable_type, key),
        before: this.formatAuditValue(key, oldValues?.[key]),
        after: this.formatAuditValue(key, newValues?.[key]),
      }))
      .filter((row) => {
        if (audit.event === 'updated') {
          return row.before !== row.after;
        }
        return audit.event === 'deleted'
          ? row.before !== '' && row.before !== '—'
          : row.before !== '' || row.after !== '';
      });
  }

  getSingleAuditValue(event: string, row: AuditRow): string {
    if (event === 'deleted') {
      return row.before;
    }

    return row.after;
  }

  private getFieldLabel(type: string, field: string): string {
    return (
      this.fieldLabels[type]?.[field] ||
      this.toTitleCase(field.replace(/_/g, ' '))
    );
  }

  private formatAuditValue(field: string, value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
      if (field === 'user_id') {
        return this.getUserName(value);
      }

      if (field === 'camioneta_id') {
        return this.getCamionetaName(value);
      }

      if (field === 'reserva_id') {
        return this.getReservaName(value);
      }

      return value.toString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    const text = String(value);

    if (field === 'estado') {
      return this.formatEstado(text);
    }

    if (this.isDateLike(text)) {
      return this.formatDateTime(text);
    }

    return text;
  }

  private getUserName(value: unknown): string {
    const id = Number(value);
    if (!Number.isFinite(id)) {
      return '—';
    }

    return this.usuariosMap.get(id) || `Usuario #${id}`;
  }

  private getCamionetaName(value: unknown): string {
    const id = Number(value);
    if (!Number.isFinite(id)) {
      return '—';
    }

    return this.camionetasMap.get(id) || `Camioneta #${id}`;
  }

  private getReservaName(value: unknown): string {
    const id = Number(value);
    if (!Number.isFinite(id)) {
      return '—';
    }

    return this.reservasMap.get(id) || `Reserva #${id}`;
  }

  private formatFechaReserva(value: unknown): string {
    if (!value) return '';
    const text = String(value);
    return text.substring(0, 10);
  }

  private formatHoraReserva(horaInicio: unknown, horaFin: unknown): string {
    const inicio = horaInicio ? String(horaInicio).substring(0, 5) : '';
    const fin = horaFin ? String(horaFin).substring(0, 5) : '';
    return inicio && fin ? `${inicio} - ${fin}` : '';
  }

  private normalizeValues(values: unknown): Record<string, unknown> {
    if (!values) {
      return {};
    }

    if (typeof values === 'string') {
      try {
        return JSON.parse(values);
      } catch {
        return {};
      }
    }

    if (typeof values === 'object') {
      return values as Record<string, unknown>;
    }

    return {};
  }

  private formatEstado(value: string): string {
    switch (value) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      case 'en_uso':
        return 'En uso';
      case 'finalizado':
        return 'Finalizado';
      default:
        return this.toTitleCase(value.replace(/_/g, ' '));
    }
  }

  private isDateLike(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}/.test(value);
  }

  private formatDateTime(value: string): string {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  }

  private toTitleCase(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}

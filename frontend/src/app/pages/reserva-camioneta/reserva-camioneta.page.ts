import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonChip,
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  chevronBackOutline,
  chevronForwardOutline,
  saveOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';
import { ApiService, Camioneta, Reserva } from '../../services/api.service';
import { PermisosService } from '../../services/permisos.service';

interface TimeSlot {
  time: string;
  display: string;
}

interface DaySlots {
  fecha: Date;
  fechaStr: string;
  label: string;
  slots: SlotStatus[];
}

interface SlotStatus {
  time: string;
  display: string;
  estado: 'disponible' | 'ocupado' | 'seleccionado' | 'pasado';
  reserva?: Reserva;
  reservadoPor?: string;
}

@Component({
  selector: 'app-reserva-camioneta',
  templateUrl: './reserva-camioneta.page.html',
  styleUrls: ['./reserva-camioneta.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonLabel,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonChip,
  ],
})
export class ReservaCamionetaPage implements OnInit, OnDestroy {
  camionetas: Camioneta[] = [];
  selectedCamionetaId: number | null = null;
  days: DaySlots[] = [];
  timeSlots: TimeSlot[] = [];
  loading = false;
  notas = '';

  // Selección por arrastre
  isSelecting = false;
  isDragging = false;
  selectionStart: { dayIndex: number; slotIndex: number } | null = null;
  selectionEnd: { dayIndex: number; slotIndex: number } | null = null;
  selectedSlots: Set<string> = new Set(); // "dayIndex-slotIndex"

  private refreshInterval: any;

  constructor(
    private apiService: ApiService,
    public permisos: PermisosService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
    addIcons({
      calendarOutline,
      chevronBackOutline,
      chevronForwardOutline,
      saveOutline,
      refreshOutline,
      timeOutline,
    });
  }

  ngOnInit() {
    this.generateTimeSlots();
    this.loadCamionetas();

    // Actualizar cada 30 segundos
    this.refreshInterval = setInterval(() => {
      if (this.selectedCamionetaId) {
        this.loadReservas();
      }
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        this.timeSlots.push({ time, display: time });
      }
    }
  }

  loadCamionetas() {
    this.apiService.getCamionetasActivas().subscribe({
      next: (res) => {
        this.camionetas = res.data || [];
        // Si solo hay una camioneta activa, seleccionarla automáticamente
        if (this.camionetas.length === 1) {
          this.selectedCamionetaId = this.camionetas[0].id;
          this.onCamionetaChange();
        }
      },
    });
  }

  onCamionetaChange() {
    this.clearSelection();
    this.loadReservas();
  }

  loadReservas() {
    if (!this.selectedCamionetaId) return;

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 9); // 10 días incluyendo hoy

    const fechaInicio = this.formatDate(today);
    const fechaFin = this.formatDate(endDate);

    this.loading = true;
    this.apiService
      .getSlotsOcupados(this.selectedCamionetaId, fechaInicio, fechaFin)
      .subscribe({
        next: (res) => {
          const reservas = res.data || [];
          this.buildDaysGrid(today, reservas);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  buildDaysGrid(startDate: Date, reservas: Reserva[]) {
    this.days = [];
    const now = new Date();

    for (let d = 0; d < 10; d++) {
      const fecha = new Date(startDate);
      fecha.setDate(startDate.getDate() + d);
      const fechaStr = this.formatDate(fecha);

      const dayReservas = reservas.filter((r) => {
        const rFecha = r.fecha ? r.fecha.substring(0, 10) : '';
        return rFecha === fechaStr;
      });

      const slots: SlotStatus[] = this.timeSlots.map((ts) => {
        // Verificar si el slot ya pasó
        const slotDateTime = new Date(fecha);
        const [hours, minutes] = ts.time.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        if (slotDateTime < now) {
          return {
            time: ts.time,
            display: ts.display,
            estado: 'pasado' as const,
          };
        }

        // Verificar si está ocupado
        const reservaOcupando = dayReservas.find((r) => {
          const inicio = r.hora_inicio ? r.hora_inicio.substring(0, 5) : '';
          const fin = r.hora_fin ? r.hora_fin.substring(0, 5) : '';
          return ts.time >= inicio && ts.time < fin;
        });

        if (reservaOcupando) {
          const rInicio = reservaOcupando.hora_inicio
            ? reservaOcupando.hora_inicio.substring(0, 5)
            : '';
          const rFin = reservaOcupando.hora_fin
            ? reservaOcupando.hora_fin.substring(0, 5)
            : '';
          return {
            time: ts.time,
            display: ts.display,
            estado: 'ocupado' as const,
            reserva: reservaOcupando,
            reservadoPor: `${reservaOcupando.user?.name || 'Ocupado'} (${rInicio}-${rFin})`,
          };
        }

        // Verificar si está seleccionado
        const key = `${d}-${this.timeSlots.findIndex((t) => t.time === ts.time)}`;
        if (this.selectedSlots.has(key)) {
          return {
            time: ts.time,
            display: ts.display,
            estado: 'seleccionado' as const,
          };
        }

        return {
          time: ts.time,
          display: ts.display,
          estado: 'disponible' as const,
        };
      });

      const dayNames = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
      ];
      const monthNames = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];

      this.days.push({
        fecha,
        fechaStr,
        label: `${dayNames[fecha.getDay()]} ${fecha.getDate()} de ${monthNames[fecha.getMonth()]}`,
        slots,
      });
    }
  }

  // === Selección de slots por clic/arrastre ===
  onSlotMouseDown(dayIndex: number, slotIndex: number) {
    const slot = this.days[dayIndex].slots[slotIndex];
    if (slot.estado === 'ocupado' || slot.estado === 'pasado') return;

    this.isDragging = false;
    this.isSelecting = true;
    this.selectionStart = { dayIndex, slotIndex };
    this.selectionEnd = { dayIndex, slotIndex };
  }

  onSlotMouseEnter(dayIndex: number, slotIndex: number) {
    if (!this.isSelecting || !this.selectionStart) return;
    // Solo permitir selección dentro del mismo día
    if (dayIndex !== this.selectionStart.dayIndex) return;

    this.isDragging = true;
    this.selectionEnd = { dayIndex, slotIndex };
    this.updateSelection();
  }

  onSlotMouseUp() {
    if (this.isSelecting && this.isDragging) {
      // Arrastre completado: la selección ya está aplicada por updateSelection
    }
    this.isSelecting = false;
  }

  onSlotClick(dayIndex: number, slotIndex: number) {
    // Si fue un arrastre, ignorar el click
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }

    const slot = this.days[dayIndex].slots[slotIndex];
    if (slot.estado === 'ocupado' || slot.estado === 'pasado') return;

    // Si ya hay una selección en otro día, limpiar
    if (this.selectedSlots.size > 0) {
      const existingKey = Array.from(this.selectedSlots)[0];
      const existingDayIndex = parseInt(existingKey.split('-')[0]);
      if (existingDayIndex !== dayIndex) {
        this.clearSelection();
      }
    }

    // Si ya hay slots seleccionados, usar como rango (inicio → fin)
    if (this.selectedSlots.size > 0) {
      const keys = Array.from(this.selectedSlots).map((k) =>
        parseInt(k.split('-')[1]),
      );
      const firstSlot = Math.min(...keys);
      const start = Math.min(firstSlot, slotIndex);
      const end = Math.max(firstSlot, slotIndex);

      // Verificar que no haya slots ocupados en el rango
      let hayOcupado = false;
      for (let i = start; i <= end; i++) {
        const s = this.days[dayIndex].slots[i];
        if (s.estado === 'ocupado') {
          hayOcupado = true;
          break;
        }
      }

      if (hayOcupado) {
        // No se puede seleccionar un rango que cruce reservas existentes
        // Reiniciar selección con el nuevo slot
        this.selectedSlots.clear();
        this.selectedSlots.add(`${dayIndex}-${slotIndex}`);
      } else {
        this.selectedSlots.clear();
        for (let i = start; i <= end; i++) {
          const s = this.days[dayIndex].slots[i];
          if (s.estado !== 'pasado') {
            this.selectedSlots.add(`${dayIndex}-${i}`);
          }
        }
      }
    } else {
      // Primer click: seleccionar solo este slot
      this.selectedSlots.add(`${dayIndex}-${slotIndex}`);
    }

    this.refreshSlotStates();
  }

  private updateSelection() {
    if (!this.selectionStart || !this.selectionEnd) return;

    this.selectedSlots.clear();
    const dayIndex = this.selectionStart.dayIndex;
    const start = Math.min(
      this.selectionStart.slotIndex,
      this.selectionEnd.slotIndex,
    );
    const end = Math.max(
      this.selectionStart.slotIndex,
      this.selectionEnd.slotIndex,
    );

    for (let i = start; i <= end; i++) {
      const slot = this.days[dayIndex].slots[i];
      if (slot.estado !== 'ocupado' && slot.estado !== 'pasado') {
        this.selectedSlots.add(`${dayIndex}-${i}`);
      }
    }

    this.refreshSlotStates();
  }

  private refreshSlotStates() {
    this.days.forEach((day, dIdx) => {
      day.slots.forEach((slot, sIdx) => {
        if (slot.estado === 'ocupado' || slot.estado === 'pasado') return;
        const key = `${dIdx}-${sIdx}`;
        slot.estado = this.selectedSlots.has(key)
          ? 'seleccionado'
          : 'disponible';
      });
    });
  }

  clearSelection() {
    this.selectedSlots.clear();
    this.selectionStart = null;
    this.selectionEnd = null;
    this.refreshSlotStates();
  }

  getSelectedRange(): {
    dayIndex: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  } | null {
    if (this.selectedSlots.size === 0) return null;

    const keys = Array.from(this.selectedSlots)
      .map((k) => {
        const [d, s] = k.split('-').map(Number);
        return { dayIndex: d, slotIndex: s };
      })
      .sort((a, b) => a.slotIndex - b.slotIndex);

    const dayIndex = keys[0].dayIndex;
    const first = keys[0].slotIndex;
    const last = keys[keys.length - 1].slotIndex;

    const horaInicio = this.timeSlots[first].time;
    // La hora fin es el slot siguiente al último seleccionado
    const horaFin =
      last + 1 < this.timeSlots.length
        ? this.timeSlots[last + 1].time
        : '23:59';

    return {
      dayIndex,
      fecha: this.days[dayIndex].fechaStr,
      horaInicio,
      horaFin,
    };
  }

  async guardarReserva() {
    const range = this.getSelectedRange();
    if (!range || !this.selectedCamionetaId) {
      const toast = await this.toastController.create({
        message: 'Selecciona una camioneta y los horarios deseados',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Reserva',
      message: `¿Deseas reservar el ${this.days[range.dayIndex].label} de ${range.horaInicio} a ${range.horaFin}?`,
      inputs: [
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas (opcional)',
          value: this.notas,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reservar',
          handler: async (data) => {
            const loading = await this.loadingController.create({
              message: 'Guardando reserva...',
            });
            await loading.present();

            this.apiService
              .createReserva({
                camioneta_id: this.selectedCamionetaId!,
                fecha: range.fecha,
                hora_inicio: range.horaInicio,
                hora_fin: range.horaFin,
                notas: data.notas || null,
              })
              .subscribe({
                next: async () => {
                  await loading.dismiss();
                  const toast = await this.toastController.create({
                    message:
                      'Reserva guardada y notificación enviada a Telegram',
                    duration: 3000,
                    color: 'success',
                  });
                  await toast.present();
                  this.clearSelection();
                  this.notas = '';
                  this.loadReservas();
                },
                error: async (err) => {
                  await loading.dismiss();
                  const errorMsg =
                    err.error?.message || 'Error al guardar la reserva';
                  const errorAlert = await this.alertController.create({
                    header: 'Error',
                    message: errorMsg,
                    buttons: ['OK'],
                  });
                  await errorAlert.present();
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Para mostrar 4 columnas en la grilla de slots
  getColumnSlots(daySlots: SlotStatus[]): SlotStatus[][] {
    const cols: SlotStatus[][] = [[], [], [], []];
    daySlots.forEach((slot, i) => {
      cols[i % 4].push(slot);
    });
    return cols;
  }

  getSlotIndex(slot: SlotStatus): number {
    return this.timeSlots.findIndex((ts) => ts.time === slot.time);
  }
}

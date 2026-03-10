import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-firma-pad',
  templateUrl: './firma-pad.component.html',
  styleUrls: ['./firma-pad.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class FirmaPadComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    // Usar setTimeout para asegurar que el canvas esté renderizado
    setTimeout(() => {
      const canvas = this.canvas.nativeElement;
      if (!canvas) {
        console.error('Canvas no encontrado');
        return;
      }

      this.ctx = canvas.getContext('2d')!;

      // Configurar tamaño del canvas basado en el contenedor
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth - 4; // Restar borde
        canvas.height = 200;
      } else {
        canvas.width = 500; // Tamaño por defecto
        canvas.height = 200;
      }

      console.log('Canvas inicializado:', canvas.width, 'x', canvas.height);

      // Establecer fondo blanco
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configurar estilo del trazo
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      console.log('Contexto configurado - listo para dibujar');

      // Eventos táctiles para móvil
      canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
        passive: false,
      });
      canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
        passive: false,
      });
      canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

      // Eventos de mouse para web
      canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
      canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

      console.log('Event listeners agregados');
    }, 300);
  }

  // Touch events
  handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
    this.drawing = true;
  }

  handleTouchMove(e: TouchEvent) {
    if (!this.drawing) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, x, y);
    this.lastX = x;
    this.lastY = y;
  }

  handleTouchEnd(e: TouchEvent) {
    this.drawing = false;
  }

  // Mouse events
  handleMouseDown(e: MouseEvent) {
    console.log('Mouse down');
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    this.drawing = true;
    console.log('Drawing iniciado en:', this.lastX, this.lastY);
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.drawing) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, x, y);
    this.lastX = x;
    this.lastY = y;
  }

  handleMouseUp(e: MouseEvent) {
    if (this.drawing) {
      console.log('Mouse up - fin del trazo');
    }
    this.drawing = false;
  }

  // Dibujar línea
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    console.log('Dibujando línea de', x1, y1, 'a', x2, y2);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  // Limpiar canvas
  limpiar() {
    const canvas = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Restaurar fondo blanco
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restaurar color de trazo
    this.ctx.strokeStyle = '#000000';
  }

  // Verificar si hay firma
  isEmpty(): boolean {
    const canvas = this.canvas.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Verificar si hay píxeles no blancos
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Si encontramos un píxel con alpha > 0, hay firma
      if (imageData.data[i + 3] > 0) {
        return false;
      }
    }
    return true;
  }

  // Guardar firma como base64
  async guardar() {
    if (this.isEmpty()) {
      alert('Por favor, dibuje su firma');
      return;
    }

    const firmaBase64 = this.canvas.nativeElement.toDataURL('image/png');
    await this.modalCtrl.dismiss(firmaBase64);
  }

  // Cancelar
  async cancelar() {
    await this.modalCtrl.dismiss();
  }
}

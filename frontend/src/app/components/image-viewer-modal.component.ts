import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-image-viewer-modal',
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Imagen del Registro</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="dark">
      <div class="image-container">
        <img [src]="imageUrl" alt="Imagen del registro" (click)="cerrar()" />
      </div>
    </ion-content>
  `,
  styles: [
    `
      .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        cursor: pointer;
        border-radius: 8px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
  ],
})
export class ImageViewerModalComponent {
  @Input() imageUrl!: string;

  constructor(private modalCtrl: ModalController) {}

  async cerrar() {
    await this.modalCtrl.dismiss();
  }
}

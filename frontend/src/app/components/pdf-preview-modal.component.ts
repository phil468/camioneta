import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSpinner,
  IonFooter,
} from '@ionic/angular/standalone';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Vista Previa del PDF</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="pdf-container">
        <iframe
          *ngIf="pdfUrl"
          [src]="pdfUrl"
          width="100%"
          height="100%"
          frameborder="0"
        ></iframe>
        <div *ngIf="!pdfUrl" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>Cargando vista previa...</p>
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cerrar()">
            <ion-icon name="close-outline" slot="start"></ion-icon>
            Cerrar
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="descargar()" color="primary" fill="solid">
            <ion-icon name="download-outline" slot="start"></ion-icon>
            Descargar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [
    `
      .pdf-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      iframe {
        border: none;
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
    IonSpinner,
    IonFooter,
  ],
})
export class PdfPreviewModalComponent implements OnInit {
  @Input() pdfBlob?: Blob;
  @Input() fileName: string = 'documento.pdf';
  pdfUrl?: SafeResourceUrl;

  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    if (this.pdfBlob) {
      const url = URL.createObjectURL(this.pdfBlob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  descargar() {
    this.modalCtrl.dismiss({ download: true }, 'download');
  }
}

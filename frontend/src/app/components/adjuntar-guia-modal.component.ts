import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  AlertController,
  LoadingController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonFooter,
} from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-adjuntar-guia-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Adjuntar Guía de Remisión</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Formulario -->
      <form [formGroup]="guiaForm">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Información de la Guía</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Serie de Guía *</ion-label>
              <ion-input
                formControlName="serie_guia"
                placeholder="Ej: TR13, T001"
                maxlength="10"
              ></ion-input>
            </ion-item>
            <ion-note
              color="danger"
              *ngIf="
                guiaForm.get('serie_guia')?.invalid &&
                guiaForm.get('serie_guia')?.touched
              "
            >
              La serie es requerida
            </ion-note>

            <ion-item>
              <ion-label position="stacked">Número de Guía *</ion-label>
              <ion-input
                formControlName="numero_guia"
                placeholder="Ej: 1983, 0001983"
                maxlength="10"
                type="number"
              ></ion-input>
            </ion-item>
            <ion-note
              color="danger"
              *ngIf="
                guiaForm.get('numero_guia')?.invalid &&
                guiaForm.get('numero_guia')?.touched
              "
            >
              El número es requerido
            </ion-note>
          </ion-card-content>
        </ion-card>

        <!-- Subir Archivo PDF -->
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Archivo PDF</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <input
              #fileInput
              type="file"
              accept="application/pdf"
              (change)="onFileSelected($event)"
              style="display: none;"
            />

            <ion-button
              expand="block"
              fill="outline"
              (click)="fileInput.click()"
              [disabled]="!!selectedFile"
            >
              <ion-icon slot="start" name="cloud-upload-outline"></ion-icon>
              {{ selectedFile ? 'Archivo seleccionado' : 'Seleccionar PDF' }}
            </ion-button>

            <ion-item *ngIf="selectedFile" lines="none">
              <ion-icon
                name="document-outline"
                slot="start"
                color="primary"
              ></ion-icon>
              <ion-label>
                <h3>{{ selectedFile.name }}</h3>
                <p>{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
              </ion-label>
              <ion-button
                fill="clear"
                color="danger"
                slot="end"
                (click)="removeFile()"
              >
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>

            <ion-note color="medium" class="ion-margin-top">
              * El PDF de la guía es opcional. Si lo adjuntas, podrás
              visualizarlo más adelante.
            </ion-note>
          </ion-card-content>
        </ion-card>

        <!-- Vista Previa del PDF -->
        <ion-card *ngIf="pdfPreviewUrl">
          <ion-card-header>
            <ion-card-subtitle>Vista Previa</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="pdf-preview-container">
              <iframe
                [src]="pdfPreviewUrl"
                width="100%"
                height="400px"
                frameborder="0"
              ></iframe>
            </div>
          </ion-card-content>
        </ion-card>
      </form>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cerrar()" fill="clear"> Cancelar </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button
            (click)="guardar()"
            color="primary"
            fill="solid"
            [disabled]="guiaForm.invalid"
          >
            <ion-icon name="save-outline" slot="start"></ion-icon>
            Guardar Guía
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [
    `
      .pdf-preview-container {
        width: 100%;
        min-height: 400px;
        border: 1px solid var(--ion-color-medium);
        border-radius: 8px;
        overflow: hidden;
      }

      ion-note {
        display: block;
        margin-top: 8px;
      }

      iframe {
        border: none;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonFooter,
  ],
})
export class AdjuntarGuiaModalComponent implements OnInit {
  @Input() registroId!: number;

  guiaForm!: FormGroup;
  selectedFile: File | null = null;
  pdfPreviewUrl?: SafeResourceUrl;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {
    // Configurar worker de PDF.js desde assets local
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
  }

  ngOnInit() {
    this.guiaForm = this.fb.group({
      serie_guia: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
        ],
      ],
      numero_guia: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
        ],
      ],
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.mostrarError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      this.mostrarError('El archivo no debe superar los 10MB');
      return;
    }

    this.selectedFile = file;
    this.generarVistaPrevia();
    this.intentarExtraerDatos();
  }

  removeFile() {
    this.selectedFile = null;
    this.pdfPreviewUrl = undefined;
  }

  generarVistaPrevia() {
    if (this.selectedFile) {
      const url = URL.createObjectURL(this.selectedFile);
      this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  async intentarExtraerDatos() {
    // Intentar extraer serie y número del nombre del archivo y del contenido del PDF
    if (!this.selectedFile) return;

    const fileName = this.selectedFile.name;
    let serieEncontrada = '';
    let numeroEncontrado = '';

    // PASO 1: Intentar extraer del nombre del archivo
    // Patrón 1: TR13-1983 (letras+números-números de 1-8 dígitos)
    const pattern1 = /([A-Z]{1,4}\d{1,4})-(\d{1,8})/i;
    // Patrón 2: TR13_1983 (con guion bajo)
    const pattern2 = /([A-Z]{1,4}\d{1,4})_(\d{1,8})/i;
    // Patrón 3: TR13 1983 (con espacio)
    const pattern3 = /([A-Z]{1,4}\d{1,4})\s+(\d{1,8})/i;
    // Patrón 4: Al inicio del nombre con guion: TR13-1983
    const pattern4 = /^([A-Z]{1,4}\d{1,4})-(\d{1,8})/i;

    let match =
      fileName.match(pattern4) ||
      fileName.match(pattern1) ||
      fileName.match(pattern2) ||
      fileName.match(pattern3);

    if (match) {
      serieEncontrada = match[1].toUpperCase();
      numeroEncontrado = match[2];
    }

    // PASO 2: Si no se encontró en el nombre, intentar extraer del contenido del PDF
    if (!serieEncontrada || !numeroEncontrado) {
      const loading = await this.loadingCtrl.create({
        message: 'Analizando contenido del PDF...',
      });
      await loading.present();

      try {
        const datosExtraidos = await this.extraerDatosDelPDF(this.selectedFile);
        if (datosExtraidos.serie && !serieEncontrada) {
          serieEncontrada = datosExtraidos.serie;
        }
        if (datosExtraidos.numero && !numeroEncontrado) {
          numeroEncontrado = datosExtraidos.numero;
        }
      } catch (error) {
        console.error('Error al analizar PDF:', error);
      } finally {
        await loading.dismiss();
      }
    }

    // PASO 3: Si se encontraron datos, preguntar al usuario
    if (serieEncontrada && numeroEncontrado) {
      const alert = await this.alertCtrl.create({
        header: 'Datos Detectados',
        message: `Se detectó la siguiente información:
                  Serie: ${serieEncontrada}
                  Número: ${numeroEncontrado}
                  ¿Deseas usar estos datos?`,
        buttons: [
          {
            text: 'No, ingresaré manualmente',
            role: 'cancel',
          },
          {
            text: 'Sí, usar datos',
            handler: () => {
              this.guiaForm.patchValue({
                serie_guia: serieEncontrada,
                numero_guia: numeroEncontrado,
              });
            },
          },
        ],
      });

      // Configurar innerHTMLTemplatesEnabled antes de presentar
      (alert as any).innerHTMLTemplatesEnabled = true;
      await alert.present();
    } else if (serieEncontrada || numeroEncontrado) {
      // Solo se encontró uno de los dos
      const alert = await this.alertCtrl.create({
        header: 'Datos Parciales',
        message: `Se detectó información parcial:
                  ${serieEncontrada ? `Serie: ${serieEncontrada}` : ''}
                  ${numeroEncontrado ? `Número: ${numeroEncontrado}` : ''}
                  ¿Deseas usar estos datos?`,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí, usar',
            handler: () => {
              if (serieEncontrada) {
                this.guiaForm.patchValue({ serie_guia: serieEncontrada });
              }
              if (numeroEncontrado) {
                this.guiaForm.patchValue({ numero_guia: numeroEncontrado });
              }
            },
          },
        ],
      });

      // Configurar innerHTMLTemplatesEnabled antes de presentar
      (alert as any).innerHTMLTemplatesEnabled = true;
      await alert.present();
    }
  }

  /**
   * Extraer datos del contenido del PDF usando PDF.js
   */
  private async extraerDatosDelPDF(
    file: File,
  ): Promise<{ serie: string; numero: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let textoCompleto = '';

        // Leer las primeras 3 páginas (donde suele estar la info)
        const paginas = Math.min(pdf.numPages, 3);

        for (let i = 1; i <= paginas; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // Usar tipo any para evitar error de ImageDataArray
          const textosPagina = textContent.items
            .map((item: any) => {
              // Los items pueden tener la propiedad 'str' o 'chars'
              return typeof item === 'object' && 'str' in item ? item.str : '';
            })
            .join(' ');
          textoCompleto += textosPagina + ' ';
        }

        // Buscar patrones en el texto extraído
        let serie = '';
        let numero = '';

        // Patrón 1: TR13 - N° 0001983 (serie - N° número)
        const pattern1 = /([A-Z]{1,4}\d{1,4})\s*-\s*N°\s*(\d{4,8})/i;
        const match1 = textoCompleto.match(pattern1);
        if (match1) {
          serie = match1[1].toUpperCase();
          numero = match1[2].replace(/^0+/, '') || match1[2]; // Quitar ceros iniciales pero mantener al menos 1
        }

        // Patrón 2: Buscar "SERIE" o "Serie" seguido de código
        if (!serie) {
          const patternSerie =
            /(?:SERIE|Serie|serie)[\s:]*([A-Z]{1,4}\d{1,4})/i;
          const matchSerie = textoCompleto.match(patternSerie);
          if (matchSerie) {
            serie = matchSerie[1].toUpperCase();
          }
        }

        // Patrón 3: Buscar "N°", "Nro", "NUMERO", "NÚMERO" seguido de dígitos
        if (!numero) {
          const patternNumero =
            /(?:N°|Nº|Nro\.?|NUMERO|NÚMERO|Número|numero)[\s:]*0*(\d{1,8})/i;
          const matchNumero = textoCompleto.match(patternNumero);
          if (matchNumero) {
            numero = matchNumero[1];
          }
        }

        // Patrón 4: Buscar patrón general al inicio: TR13-00012345 o TR13 - N° 1983
        if (!serie || !numero) {
          const patternGeneral =
            /([A-Z]{1,4}\d{1,4})[\s\-_]+(?:N°\s*)?0*(\d{1,8})/i;
          const matchGeneral = textoCompleto.match(patternGeneral);
          if (matchGeneral) {
            serie = serie || matchGeneral[1].toUpperCase();
            numero = numero || matchGeneral[2];
          }
        }

        resolve({ serie, numero });
      } catch (error) {
        console.error('Error al leer PDF:', error);
        resolve({ serie: '', numero: '' });
      }
    });
  }

  async guardar() {
    if (this.guiaForm.invalid) {
      const toast = await this.alertCtrl.create({
        header: 'Formulario Incompleto',
        message: 'Por favor completa todos los campos requeridos',
        buttons: ['OK'],
      });
      await toast.present();
      return;
    }

    const formData = new FormData();
    formData.append('serie_guia', this.guiaForm.value.serie_guia);
    formData.append('numero_guia', this.guiaForm.value.numero_guia);

    // Solo agregar el PDF si existe
    if (this.selectedFile) {
      formData.append('pdf', this.selectedFile, this.selectedFile.name);
    }

    this.modalCtrl.dismiss(
      {
        formData: formData,
        data: this.guiaForm.value,
      },
      'confirm',
    );
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

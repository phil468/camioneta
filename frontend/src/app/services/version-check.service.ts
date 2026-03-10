import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AlertController, LoadingController } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';

export interface AppVersion {
  version: string;
  versionCode: number;
  downloadUrl: string;
  forceUpdate: boolean;
  releaseNotes: string[];
}

export interface VersionResponse {
  success: boolean;
  data: AppVersion;
}

export interface VersionInfo {
  currentVersion: string;
  currentBuild: number;
  serverVersion: string | null;
  serverBuild: number | null;
  updateAvailable: boolean;
  latestVersion: AppVersion | null;
}

@Injectable({
  providedIn: 'root',
})
export class VersionCheckService {
  private apiUrl = environment.apiUrl;
  private checkIntervalMs = 5 * 60 * 1000; // Verificar cada 5 minutos
  private intervalRef: any = null;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private loadingController: LoadingController,
  ) {}

  /**
   * Iniciar verificación periódica de actualizaciones
   */
  startPeriodicCheck(): void {
    // Verificar al inicio (con delay)
    setTimeout(() => this.checkForUpdates(), 3000);

    // Verificar periódicamente
    if (!this.intervalRef) {
      this.intervalRef = setInterval(() => {
        this.checkForUpdates();
      }, this.checkIntervalMs);
    }
  }

  /**
   * Detener verificación periódica
   */
  stopPeriodicCheck(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  /**
   * Verificar si hay una nueva versión disponible (silencioso)
   */
  async checkForUpdates(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const info = await this.getVersionInfo();
      if (info.updateAvailable && info.latestVersion) {
        await this.showUpdateAlert(info.latestVersion, info.currentVersion);
      }
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
    }
  }

  /**
   * Verificación manual desde el menú (con loading y feedback)
   */
  async checkForUpdatesManual(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Verificando versión...',
      duration: 10000,
    });
    await loading.present();

    try {
      if (!Capacitor.isNativePlatform()) {
        await loading.dismiss();
        // En web, solo mostrar la versión del servidor
        await this.showWebVersionInfo();
        return;
      }

      const info = await this.getVersionInfo();
      await loading.dismiss();

      if (info.updateAvailable && info.latestVersion) {
        await this.showUpdateAlert(info.latestVersion, info.currentVersion);
      } else {
        await this.showUpToDateAlert(info);
      }
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Error',
        message:
          'No se pudo verificar la versión. Verifica tu conexión a internet.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  /**
   * Obtener información de versiones (instalada vs servidor)
   */
  private getVersionInfo(): Promise<VersionInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const appInfo = await App.getInfo();
        const currentVersion = appInfo.version;
        const currentBuild = parseInt(appInfo.build);

        this.getLatestVersion().subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const latest = response.data;
              resolve({
                currentVersion,
                currentBuild,
                serverVersion: latest.version,
                serverBuild: latest.versionCode,
                updateAvailable: latest.versionCode > currentBuild,
                latestVersion: latest,
              });
            } else {
              resolve({
                currentVersion,
                currentBuild,
                serverVersion: null,
                serverBuild: null,
                updateAvailable: false,
                latestVersion: null,
              });
            }
          },
          error: (err) => reject(err),
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Mostrar info cuando la app está actualizada
   */
  private async showUpToDateAlert(info: VersionInfo): Promise<void> {
    const alert = await this.alertController.create({
      header: '✅ App actualizada',
      message: `<div style="text-align:center">
        <p><strong>Versión instalada:</strong> ${info.currentVersion} (build ${info.currentBuild})</p>
        <p><strong>Versión en servidor:</strong> ${info.serverVersion || 'N/A'} (build ${info.serverBuild || 'N/A'})</p>
        <p style="color:var(--ion-color-success);margin-top:12px">Ya tienes la última versión instalada.</p>
      </div>`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Info de versión cuando se ejecuta en web
   */
  private async showWebVersionInfo(): Promise<void> {
    this.getLatestVersion().subscribe({
      next: async (response) => {
        const serverVersion = response.success ? response.data?.version : 'N/A';
        const serverBuild = response.success
          ? response.data?.versionCode
          : 'N/A';
        const alert = await this.alertController.create({
          header: 'ℹ️ Información de versión',
          message: `<div style="text-align:center">
            <p>Estás usando la <strong>versión web</strong>.</p>
            <p><strong>Versión APK disponible:</strong> ${serverVersion} (build ${serverBuild})</p>
            <p style="margin-top:12px;font-size:0.9em;color:var(--ion-color-medium)">La verificación automática solo funciona en la app móvil.</p>
          </div>`,
          buttons: ['OK'],
        });
        await alert.present();
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo obtener la información de versión del servidor.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  /**
   * Obtener la versión más reciente del servidor
   */
  private getLatestVersion(): Observable<VersionResponse> {
    return this.http.get<VersionResponse>(`${this.apiUrl}/app/version`).pipe(
      catchError((error) => {
        console.error('Error en getLatestVersion:', error);
        return of({ success: false, data: null as any });
      }),
    );
  }

  /**
   * Mostrar alerta de actualización disponible
   */
  private async showUpdateAlert(
    latestVersion: AppVersion,
    currentVersion: string,
  ): Promise<void> {
    // Crear mensaje con formato simple
    const novedades = latestVersion.releaseNotes
      .map((note) => `• ${note}`)
      .join('\n');

    const alert = await this.alertController.create({
      header: '🎉 Nueva versión disponible',
      subHeader: `Versión ${latestVersion.version} (actual: ${currentVersion})`,
      message: `Novedades:\n\n${novedades}`,
      cssClass: 'update-alert',
      backdropDismiss: !latestVersion.forceUpdate,
      buttons: [
        {
          text: latestVersion.forceUpdate ? 'Actualizar ahora' : 'Más tarde',
          role: latestVersion.forceUpdate ? undefined : 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Descargar',
          cssClass: 'primary',
          handler: async () => {
            // Abrir URL de descarga en el navegador
            await Browser.open({
              url: latestVersion.downloadUrl,
              presentationStyle: 'popover',
            });
          },
        },
      ],
    });

    await alert.present();

    // Si es actualización forzada, no permitir cerrar el diálogo
    if (latestVersion.forceUpdate) {
      alert.onDidDismiss().then(() => {
        // Volver a mostrar si intenta cerrar
        this.showUpdateAlert(latestVersion, currentVersion);
      });
    }
  }
}

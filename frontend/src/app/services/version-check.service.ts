import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AlertController, LoadingController } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

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
  private readonly apkMimeType = 'application/vnd.android.package-archive';
  private isChecking = false;
  private isUpdateAlertOpen = false;

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

    if (this.isChecking || this.isUpdateAlertOpen) {
      return;
    }

    this.isChecking = true;

    try {
      const info = await this.getVersionInfo();
      if (info.updateAvailable && info.latestVersion) {
        await this.showUpdateAlert(info.latestVersion, info.currentVersion);
      }
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Verificación manual desde el menú (con loading y feedback)
   */
  async checkForUpdatesManual(): Promise<void> {
    if (this.isChecking || this.isUpdateAlertOpen) {
      return;
    }

    this.isChecking = true;

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
    } finally {
      this.isChecking = false;
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
    const message = `Versión instalada: ${info.currentVersion} (build ${info.currentBuild})

Versión en servidor: ${info.serverVersion || 'N/A'} (build ${info.serverBuild || 'N/A'})

✓ Ya tienes la última versión instalada.`;

    const alert = await this.alertController.create({
      header: '✅ App actualizada',
      message: message,
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
    if (this.isUpdateAlertOpen) {
      return;
    }

    this.isUpdateAlertOpen = true;

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
        ...(latestVersion.forceUpdate
          ? []
          : [
              {
                text: 'Más tarde',
                role: 'cancel',
                cssClass: 'secondary',
              },
            ]),
        {
          text: latestVersion.forceUpdate
            ? 'Actualizar ahora'
            : 'Descargar e instalar',
          cssClass: 'primary',
          handler: async () => {
            await this.downloadAndInstallApk(latestVersion);
          },
        },
        {
          text: 'o Descargar desde el navegador',
          handler: async () => {
            await Browser.open({
              url: latestVersion.downloadUrl,
              presentationStyle: 'popover',
            });
          },
        },
      ],
    });

    alert.onDidDismiss().then(() => {
      this.isUpdateAlertOpen = false;
    });

    await alert.present();
  }

  /**
   * Descarga el APK dentro de la app y abre automáticamente el instalador.
   */
  private async downloadAndInstallApk(
    latestVersion: AppVersion,
  ): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      await Browser.open({
        url: latestVersion.downloadUrl,
        presentationStyle: 'popover',
      });
      return;
    }

    const apkFileName = `camioneta-v${latestVersion.version}-${latestVersion.versionCode}.apk`;
    const apkPath = apkFileName;
    const loading = await this.loadingController.create({
      message: 'Preparando descarga...',
      spinner: 'crescent',
      backdropDismiss: false,
    });

    let progressListener: PluginListenerHandle | null = null;

    try {
      await loading.present();

      progressListener = await Filesystem.addListener(
        'progress',
        (progress) => {
          const bytes = progress.bytes ?? 0;
          const total = progress.contentLength ?? 0;
          const percent =
            total > 0
              ? Math.max(0, Math.min(100, Math.round((bytes / total) * 100)))
              : null;

          loading.message =
            percent !== null
              ? `Descargando actualización... ${percent}% (${this.formatBytes(bytes)} / ${this.formatBytes(total)})`
              : `Descargando actualización... ${this.formatBytes(bytes)}`;
        },
      );

      await Filesystem.downloadFile({
        url: latestVersion.downloadUrl,
        path: apkPath,
        directory: Directory.Cache,
        progress: true,
      });

      loading.message = 'Abriendo instalador...';

      const { uri } = await Filesystem.getUri({
        path: apkPath,
        directory: Directory.Cache,
      });

      await FileOpener.open({
        filePath: uri,
        contentType: this.apkMimeType,
        openWithDefault: true,
      });

      await loading.dismiss();

      const installAlert = await this.alertController.create({
        header: 'Instalación iniciada',
        message:
          'Se abrió el instalador de Android. Solo falta confirmar los permisos y aceptar la instalación.',
        buttons: ['OK'],
      });
      await installAlert.present();
    } catch (error) {
      console.error('Error descargando/instalando APK:', error);

      await loading.dismiss().catch(() => undefined);

      const reason = this.normalizeUpdateError(error);
      const hint = this.getUpdateErrorHint(reason);

      const errorAlert = await this.alertController.create({
        header: 'No se pudo actualizar',
        cssClass: 'update-alert',
        message: `No fue posible descargar o abrir el instalador.\n\nDetalle: ${reason}\n\nSugerencia: ${hint}`,
        buttons: [
          {
            text: 'Abrir en navegador',
            handler: async () => {
              await Browser.open({
                url: latestVersion.downloadUrl,
                presentationStyle: 'popover',
              });
            },
          },
          'OK',
        ],
      });
      await errorAlert.present();
    } finally {
      await loading.dismiss().catch(() => undefined);

      if (progressListener) {
        await progressListener.remove();
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / Math.pow(1024, index);

    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  private normalizeUpdateError(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const err = error as {
        message?: string;
        code?: string;
        errorMessage?: string;
      };

      if (err.message) {
        return err.code ? `${err.message} (${err.code})` : err.message;
      }

      if (err.errorMessage) {
        return err.errorMessage;
      }
    }

    return 'Error desconocido al descargar/instalar APK.';
  }

  private getUpdateErrorHint(reason: string): string {
    const text = (reason || '').toLowerCase();

    if (
      text.includes('request_install_packages') ||
      text.includes('unknown') ||
      text.includes('permission') ||
      text.includes('security') ||
      text.includes('denied')
    ) {
      return 'Habilita "Permitir instalar apps desconocidas" para esta app en Ajustes de Android.';
    }

    if (
      text.includes('404') ||
      text.includes('403') ||
      text.includes('not found') ||
      text.includes('html')
    ) {
      return 'La URL de descarga no está entregando un APK válido. Verifica APP_DOWNLOAD_URL y que el archivo exista públicamente.';
    }

    if (
      text.includes('network') ||
      text.includes('timeout') ||
      text.includes('unable to resolve host') ||
      text.includes('connection')
    ) {
      return 'Revisa conexión a internet del dispositivo y que el dominio sea accesible desde red móvil.';
    }

    return 'Pulsa "Abrir en navegador"; si ahí descarga bien, el problema es permiso de instalación del sistema.';
  }
}

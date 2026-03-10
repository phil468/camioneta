# Scripts de Utilidad

## copy-pdfjs-worker.js

Este script copia automáticamente el archivo worker de PDF.js desde `node_modules` a `src/assets/` para que esté disponible localmente en la aplicación.

### ¿Por qué?

PDF.js requiere un archivo worker para procesar PDFs en segundo plano. En lugar de usar un CDN externo, mantenemos este archivo localmente para:

- ✅ Funcionar offline
- ✅ Mayor control de versiones
- ✅ Mejor rendimiento (sin latencia de red)
- ✅ Mayor seguridad

### Ejecución

El script se ejecuta automáticamente después de `npm install` gracias al hook `postinstall` en `package.json`.

También puede ejecutarse manualmente:

```bash
node scripts/copy-pdfjs-worker.js
```

### Ubicación del archivo

- **Origen**: `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
- **Destino**: `src/assets/pdf.worker.min.mjs`

### Configuración en el código

En `adjuntar-guia-modal.component.ts`:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/pdf.worker.min.mjs";
```

### Git

El archivo generado está en `.gitignore` para evitar subirlo al repositorio, ya que se genera automáticamente.

const fs = require('fs');
const path = require('path');

// Rutas
const source = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destination = path.join(__dirname, '..', 'src', 'assets', 'pdf.worker.min.mjs');

// Crear directorio assets si no existe
const assetsDir = path.dirname(destination);
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Copiar archivo
try {
    fs.copyFileSync(source, destination);
    console.log('✅ PDF.js worker copiado exitosamente a src/assets/');
} catch (error) {
    console.error('❌ Error al copiar PDF.js worker:', error.message);
    process.exit(1);
}

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pe.vanguardfresh.jabasyparihuelas',
  appName: 'Jabas y Parihuelas',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Descomentar para depurar con servidor local
    // url: 'http://192.168.1.X:8100', // Reemplaza X con la IP de tu PC
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#568BA5',
      showSpinner: false,
    },
  },
};

export default config;

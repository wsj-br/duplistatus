import { t, type Dictionary } from 'intlayer';

export default {
  key: 'ntfy-qr-modal',
  content: {
    title: t({
      en: 'Configure your device',
      de: 'Gerät konfigurieren',
      fr: 'Configurer votre appareil',
      es: 'Configurar su dispositivo',
      'pt-BR': 'Configurar seu dispositivo',
    }),
    description: t({
      en: 'Scan this QR code with your device to receive NTFY notifications for this topic.',
      de: 'Scannen Sie diesen QR-Code mit Ihrem Gerät, um NTFY-Benachrichtigungen für dieses Thema zu erhalten.',
      fr: 'Scannez ce code QR avec votre appareil pour recevoir les notifications NTFY pour ce sujet.',
      es: 'Escanee este código QR con su dispositivo para recibir notificaciones NTFY para este tema.',
      'pt-BR': 'Escaneie este código QR com seu dispositivo para receber notificações NTFY para este tópico.',
    }),
    qrCodeAlt: t({
      en: 'NTFY Configuration QR Code',
      de: 'NTFY-Konfigurations-QR-Code',
      fr: 'Code QR de configuration NTFY',
      es: 'Código QR de configuración NTFY',
      'pt-BR': 'Código QR de configuração NTFY',
    }),
    scanInstruction: t({
      en: 'Open your device camera or a QR code scanner app to scan this code.',
      de: 'Öffnen Sie Ihre Gerätekamera oder eine QR-Code-Scanner-App, um diesen Code zu scannen.',
      fr: 'Ouvrez l\'appareil photo de votre appareil ou une application de scanner de code QR pour scanner ce code.',
      es: 'Abra la cámara de su dispositivo o una aplicación de escáner de códigos QR para escanear este código.',
      'pt-BR': 'Abra a câmera do seu dispositivo ou um aplicativo de scanner de código QR para escanear este código.',
    }),
    installInstruction: t({
      en: 'Before scanning install the NTFY app from the Play Store, App Store or F-Droid',
      de: 'Installieren Sie vor dem Scannen die NTFY-App aus dem Play Store, App Store oder F-Droid',
      fr: 'Avant de scanner, installez l\'application NTFY depuis le Play Store, l\'App Store ou F-Droid',
      es: 'Antes de escanear, instale la aplicación NTFY desde Play Store, App Store o F-Droid',
      'pt-BR': 'Antes de escanear, instale o aplicativo NTFY da Play Store, App Store ou F-Droid',
    }),
  },
} satisfies Dictionary;

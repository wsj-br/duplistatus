import { t, type Dictionary } from 'intlayer';

export default {
  key: 'dashboard-page',
  content: {
    title: t({ 
      en: 'Dashboard', 
      de: 'Dashboard', 
      fr: 'Tableau de bord', 
      es: 'Panel de control', 
      'pt-BR': 'Painel' 
    }),
    subtitle: t({ 
      en: 'Monitor your backup servers and systems', 
      de: 'Überwachen Sie Ihre Backup-Server und Systeme', 
      fr: 'Surveillez vos serveurs de sauvegarde et systèmes', 
      es: 'Monitoree sus servidores de respaldo y sistemas', 
      'pt-BR': 'Monitore seus servidores de backup e sistemas' 
    }),
    alerts: {
      title: t({ 
        en: 'Alerts', 
        de: 'Warnungen', 
        fr: 'Alertes', 
        es: 'Alertas', 
        'pt-BR': 'Alertas' 
      }),
      critical: t({ 
        en: 'Critical', 
        de: 'Kritisch', 
        fr: 'Critique', 
        es: 'Crítico', 
        'pt-BR': 'Crítico' 
      }),
      warning: t({ 
        en: 'Warning', 
        de: 'Warnung', 
        fr: 'Avertissement', 
        es: 'Advertencia', 
        'pt-BR': 'Aviso' 
      }),
      info: t({ 
        en: 'Info', 
        de: 'Info', 
        fr: 'Info', 
        es: 'Info', 
        'pt-BR': 'Info' 
      }),
      noAlerts: t({ 
        en: 'No alerts', 
        de: 'Keine Warnungen', 
        fr: 'Aucune alerte', 
        es: 'Sin alertas', 
        'pt-BR': 'Sem alertas' 
      }),
      viewAll: t({ 
        en: 'View All', 
        de: 'Alle anzeigen', 
        fr: 'Voir tout', 
        es: 'Ver todo', 
        'pt-BR': 'Ver todos' 
      }),
      dismissAll: t({ 
        en: 'Dismiss All', 
        de: 'Alle verwerfen', 
        fr: 'Ignorer tout', 
        es: 'Descartar todo', 
        'pt-BR': 'Descartar todos' 
      }),
      serverOffline: t({ 
        en: 'Server Offline', 
        de: 'Server offline', 
        fr: 'Serveur hors ligne', 
        es: 'Servidor fuera de línea', 
        'pt-BR': 'Servidor offline' 
      }),
      backupFailed: t({ 
        en: 'Backup Failed', 
        de: 'Sicherung fehlgeschlagen', 
        fr: 'Sauvegarde échouée', 
        es: 'Respaldo fallido', 
        'pt-BR': 'Backup falhou' 
      }),
      diskSpaceLow: t({ 
        en: 'Disk Space Low', 
        de: 'Wenig Speicherplatz', 
        fr: 'Espace disque faible', 
        es: 'Espacio en disco bajo', 
        'pt-BR': 'Pouco espaço em disco' 
      }),
      connectionLost: t({ 
        en: 'Connection Lost', 
        de: 'Verbindung verloren', 
        fr: 'Connexion perdue', 
        es: 'Conexión perdida', 
        'pt-BR': 'Conexão perdida' 
      }),
      expiredCertificate: t({ 
        en: 'Expired Certificate', 
        de: 'Zertifikat abgelaufen', 
        fr: 'Certificat expiré', 
        es: 'Certificado expirado', 
        'pt-BR': 'Certificado expirado' 
      }),
      viewDetails: t({ 
        en: 'View Details', 
        de: 'Details anzeigen', 
        fr: 'Voir les détails', 
        es: 'Ver detalles', 
        'pt-BR': 'Ver detalhes' 
      }),
      dismiss: t({ 
        en: 'Dismiss', 
        de: 'Verwerfen', 
        fr: 'Ignorer', 
        es: 'Descartar', 
        'pt-BR': 'Descartar' 
      }),
    },
  },
} satisfies Dictionary;

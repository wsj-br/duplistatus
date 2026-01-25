import { t, type Dictionary } from 'intlayer';

export default {
  key: 'settings-page-client',
  content: {
    sidebar: {
      header: t({ 
        en: 'Settings', 
        de: 'Einstellungen', 
        fr: 'Paramètres', 
        es: 'Configuración', 
        'pt-BR': 'Configurações' 
      }),
      collapseSidebar: t({ 
        en: 'Collapse sidebar', 
        de: 'Seitenleiste einklappen', 
        fr: 'Réduire la barre latérale', 
        es: 'Contraer barra lateral', 
        'pt-BR': 'Recolher barra lateral' 
      }),
      expandSidebar: t({ 
        en: 'Expand sidebar', 
        de: 'Seitenleiste ausklappen', 
        fr: 'Développer la barre latérale', 
        es: 'Expandir barra lateral', 
        'pt-BR': 'Expandir barra lateral' 
      }),
      groups: {
        notifications: t({ 
          en: 'Notifications', 
          de: 'Benachrichtigungen', 
          fr: 'Notifications', 
          es: 'Notificaciones', 
          'pt-BR': 'Notificações' 
        }),
        integrations: t({ 
          en: 'Integrations', 
          de: 'Integrationen', 
          fr: 'Intégrations', 
          es: 'Integraciones', 
          'pt-BR': 'Integrações' 
        }),
        system: t({ 
          en: 'System', 
          de: 'System', 
          fr: 'Système', 
          es: 'Sistema', 
          'pt-BR': 'Sistema' 
        }),
      },
      items: {
        backupNotifications: t({ 
          en: 'Backup Notifications', 
          de: 'Backup-Benachrichtigungen', 
          fr: 'Notifications de sauvegarde', 
          es: 'Notificaciones de backup', 
          'pt-BR': 'Notificações de backup' 
        }),
        overdueMonitoring: t({ 
          en: 'Overdue Monitoring',
          de: 'Überfälligkeitsüberwachung',
          fr: 'Suivi des retards', 
          es: 'Monitor de atrasos', 
          'pt-BR': 'Monitoramento de atrasos' 
        }),
        templates: t({ 
          en: 'Templates', 
          de: 'Vorlagen', 
          fr: 'Modèles', 
          es: 'Plantillas', 
          'pt-BR': 'Modelos' 
        }),
        ntfy: t({ 
          en: 'NTFY', 
          de: 'NTFY', 
          fr: 'NTFY', 
          es: 'NTFY', 
          'pt-BR': 'NTFY' 
        }),
        email: t({ 
          en: 'Email',
          de: 'E-Mail', 
          fr: 'E-mail', 
          es: 'Email', 
          'pt-BR': 'E-mail' 
        }),
        servers: t({ 
          en: 'Servers', 
          de: 'Server', 
          fr: 'Serveurs', 
          es: 'Servidores', 
          'pt-BR': 'Servidores' 
        }),
        display: t({ 
          en: 'Display Settings',
          de: 'Anzeigeeinstellungen',
          fr: 'Paramètres d\'affichage',
          es: 'Configuración de visualización',
          'pt-BR': 'Configurações de exibição'
        }),
        databaseMaintenance: t({ 
          en: 'Database Maintenance', 
          de: 'Datenbankwartung', 
          fr: 'Maintenance de la base de données', 
          es: 'Mantenimiento de base de datos', 
          'pt-BR': 'Manutenção do banco de dados' 
        }),
        users: t({ 
          en: 'Users', 
          de: 'Benutzer', 
          fr: 'Utilisateurs', 
          es: 'Usuarios', 
          'pt-BR': 'Usuários' 
        }),
        auditLog: t({ 
          en: 'Audit Log', 
          de: 'Audit-Log', 
          fr: 'Journal d\'Audit', 
          es: 'Log de Auditoría', 
          'pt-BR': 'Log de Auditoria' 
        }),
        auditLogRetention: t({ 
          en: 'Audit Log Retention',
          de: 'Audit-Log-Aufbewahrung', 
          fr: 'Rétention du journal d\'audit', 
          es: 'Retención del log de auditoría', 
          'pt-BR': 'Retenção de log de auditoria'
        }),
        applicationLogs: t({ 
          en: 'Application Logs',
          de: 'Anwendungsprotokolle', 
          fr: 'Journaux d\'application', 
          es: 'Logs de aplicación', 
          'pt-BR': 'Logs da aplicação' 
        }),
      },
      nonAdminNotice: t({ 
        en: 'Note: Settings are read-only. Some features like test notifications remain available.', 
        de: 'Hinweis: Einstellungen sind schreibgeschützt. Einige Funktionen wie Testbenachrichtigungen bleiben verfügbar.', 
        fr: 'Remarque : Les paramètres sont en lecture seule. Certaines fonctionnalités comme les notifications de test restent disponibles.', 
        es: 'Nota: La configuración es de solo lectura. Algunas funciones como las notificaciones de prueba siguen disponibles.', 
        'pt-BR': 'Nota: As configurações são somente leitura. Alguns recursos como notificações de teste permanecem disponíveis.' 
      }),
    },
    states: {
      loadingConfiguration: t({ 
        en: 'Loading configuration...', 
        de: 'Konfiguration wird geladen...', 
        fr: 'Chargement de la configuration...', 
        es: 'Cargando configuración...', 
        'pt-BR': 'Carregando configuração...' 
      }),
      noConfigurationAvailable: t({ 
        en: 'No configuration available', 
        de: 'Keine Konfiguration verfügbar', 
        fr: 'Aucune configuration disponible', 
        es: 'No hay configuración disponible', 
        'pt-BR': 'Nenhuma configuração disponível' 
      }),
    },
    toasts: {
      serverListUpdated: t({ 
        en: 'Server List Updated', 
        de: 'Serverliste aktualisiert', 
        fr: 'Liste des serveurs mise à jour', 
        es: 'Lista de servidores actualizada', 
        'pt-BR': 'Lista de servidores atualizada' 
      }),
      serverListUpdatedDescription: t({ 
        en: 'New servers detected and added to the list', 
        de: 'Neue Server erkannt und zur Liste hinzugefügt', 
        fr: 'Nouveaux serveurs détectés et ajoutés à la liste', 
        es: 'Nuevos servidores detectados y agregados a la lista', 
        'pt-BR': 'Novos servidores detectados e adicionados à lista' 
      }),
    },
  },
} satisfies Dictionary;

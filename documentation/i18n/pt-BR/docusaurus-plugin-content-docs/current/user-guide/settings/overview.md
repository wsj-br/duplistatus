---
translation_last_updated: '2026-02-14T04:57:51.805Z'
source_file_mtime: '2026-02-06T20:21:18.353Z'
source_file_hash: 6810bf2e7dc0121a
translation_language: pt-BR
source_file_path: user-guide/settings/overview.md
---
# Visão Geral {#overview}

A página de Configurações oferece uma interface unificada para configurar todos os aspectos do **duplistatus**. Você pode acessá-la clicando no botão <IconButton icon="lucide:settings" /> `Configurações` na [Barra de Ferramentas do Aplicativo](../overview#application-toolbar). Note que usuários regulares verão um menu simplificado com menos opções em comparação com os administradores.

## Visão do Administrador {#administrator-view}

Administradores veem todas as configurações disponíveis.

<table>
  <tr>
    <td>
      ![Barra Lateral de Configurações - Visão de Admin](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificações</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificações de Backup</a>: Configurar definições de notificação por backup</li>
            <li><a href="overdue-settings.md">Monitoramento de Atrasados</a>: Configurar detecção e alertas de backup atrasado</li>
            <li><a href="notification-templates.md">Modelos</a>: Personalizar modelos de mensagens de notificação</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrações</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Configurar serviço de notificações push NTFY</li>
            <li><a href="email-settings.md">E-mail</a>: Configurar notificações por e-mail SMTP</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Gerenciar configurações do servidor Duplicati</li>
            <li><a href="display-settings.md">Exibição</a>: Configurar preferências de exibição</li>
            <li><a href="database-maintenance.md">Manutenção de Banco de Dados</a>: Realizar limpeza de banco de dados (apenas admin)</li>
            <li><a href="user-management-settings.md">Usuários</a>: Gerenciar contas de usuário (apenas admin)</li>
            <li><a href="audit-logs-viewer.md">Log de Auditoria</a>: Visualizar logs de auditoria do sistema</li>
            <li><a href="audit-logs-retention.md">Retenção de Log de Auditoria</a>: Configurar retenção de log de auditoria (apenas admin)</li>
            <li><a href="application-logs-settings.md">Logs da Aplicação</a>: Visualizar e exportar logs da aplicação (apenas admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Visão de Não Administrador {#non-administrator-view}

Usuários regulares veem um conjunto limitado de configurações.

<table>
  <tr>
    <td>
      ![Barra Lateral de Configurações - Visão de Não Admin](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificações</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificações de Backup</a>: Visualizar configurações de notificação por backup (somente leitura)</li>
            <li><a href="overdue-settings.md">Monitoramento de Atrasados</a>: Visualizar configurações de backup atrasado (somente leitura)</li>
            <li><a href="notification-templates.md">Modelos</a>: Visualizar modelos de notificação (somente leitura)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrações</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Visualizar configurações NTFY (somente leitura)</li>
            <li><a href="email-settings.md">E-mail</a>: Visualizar configurações de e-mail (somente leitura)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Visualizar configurações de servidor (somente leitura)</li>
            <li><a href="display-settings.md">Exibição</a>: Configurar preferências de exibição</li>
            <li><a href="audit-logs-viewer.md">Log de Auditoria</a>: Visualizar logs de auditoria do sistema (somente leitura)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Ícones de Status {#status-icons}

A barra lateral exibe ícones de status ao lado das configurações de integração **NTFY** e **E-mail**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Ícone verde**: Suas configurações são válidas e configuradas corretamente
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Ícone amarelo**: Suas configurações não são válidas ou não estão configuradas

Quando a configuração for inválida, as caixas de seleção correspondentes na aba [`Notificações de Backup`](backup-notifications-settings.md) ficarão em cinza e desabilitadas. Para mais detalhes, consulte as páginas de [Configurações NTFY](ntfy-settings.md) e [Configurações de E-mail](email-settings.md).

<br/>

:::important
Um ícone verde não significa necessariamente que as notificações estejam funcionando corretamente. Sempre use os recursos de teste disponíveis para confirmar se suas notificações estão funcionando antes de depender delas.
:::

<br/>

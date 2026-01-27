# Bem-vindo ao duplistatus {#welcome-to-duplistatus}

**duplistatus** - Outro [Duplicati](https://github.com/duplicati/duplicati) Painel

## Recursos {#features}

- **Configuração rápida**: Implantação simples em contêiner, com imagens disponíveis no Docker Hub e GitHub.
- **Painel unificado**: Visualizar status de backup, histórico e Detalhes para Todos os Servidores em um único lugar.
- **Monitoramento de backups atrasados**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de dados e Logs**: Gráficos interativos e coleta automática de Logs de Servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado NTFY e E-mail SMTP para Notificações de backup, incluindo notificações de Backups atrasados.
- **Controle de acesso de usuário e Segurança**: Sistema de autenticação seguro com controle de acesso baseado em Função (funções Admin/Usuário), políticas de Senha configuráveis, proteção de bloqueio de conta e Gerenciamento de usuários abrangente.
- **Log de Auditoria**: Trilha de auditoria completa de Todos os Ações de Sistema e Usuários com filtragem avançada, capacidades de Exportar e períodos de retenção configuráveis.
- **Visualizador de logs do aplicativo**: Interface exclusiva de Admin para Visualizar, Pesquisar e Exportar Logs da aplicação diretamente da interface da web com capacidades de monitoramento em tempo real.

## Instalação {#installation}

A aplicação pode ser implantada usando Docker, Portainer Stacks ou Podman.
Consulte Detalhes no [Guia de instalação](installation/installation.md).

- Se você está atualizando de uma versão anterior, seu banco de dados será automaticamente
  [migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização de Versão.

- Ao usar Podman (como um contêiner autônomo ou dentro de um pod) e se você exigir Configurações de DNS Personalizado
  (como para Tailscale MagicDNS, redes corporativas ou outras Configurações de DNS Personalizado), você pode especificar manualmente Servidores DNS e domínios de Pesquisar. Consulte o guia de instalação para Detalhes adicionais.

## Configuração de Servidores Duplicati (obrigatório) {#duplicati-servers-configuration-required}

Depois que seu servidor **duplistatus** estiver ativo e funcionando, você precisa configurar seus Servidores **Duplicati** para
enviar Logs de backup para **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md)
do Guia de instalação. Sem esta Configuração, o Painel não receberá dados de backup de seus Servidores Duplicati.

## Guia do Usuário {#user-guide}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como Configurar e usar **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de tela {#screenshots}

### Painel {#dashboard}

![Painel](/assets/screen-main-dashboard-card-mode.png)

### Histórico de backups {#backup-history}

![server-detail](/assets/screen-server-backup-list.png)

### Detalhes de backup {#backup-details}

![backup-detail](/assets/screen-backup-detail.png)

### Backups atrasados {#overdue-backups}

![Backups atrasados](/assets/screen-overdue-backup-hover-card.png)

### Notificações atrasadas no seu telefone {#overdue-notifications-on-your-phone}

![Mensagem NTFY atrasada](/assets/screen-overdue-notification.png)

## Referência de API {#api-reference}

Consulte a [Documentação de endpoints de API](api-reference/overview.md) para Detalhes sobre endpoints disponíveis, formatos de solicitação/resposta e exemplos.

## Desenvolvimento {#development}

Para instruções sobre como Baixar, alterar ou executar o código, consulte [Configuração de desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com Ajuda de IA. Para saber como, consulte [Como construí este aplicativo usando ferramentas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- Em primeiro lugar, obrigado a Kenneth Skovhede por criar Duplicati—esta ferramenta de backup incrível. Obrigado também a Todos os colaboradores.

  💙 Se você achar [Duplicati](https://www.duplicati.com) útil, considere apoiar o desenvolvedor. Mais Detalhes estão disponíveis em seu site ou Página do GitHub.

- Ícone SVG Duplicati de https://dashboardicons.com/icons/duplicati

- Ícone SVG Notify de https://dashboardicons.com/icons/ntfy

- Ícone SVG GitHub de https://github.com/logos

> [!NOTE]
> Todos os nomes de produtos, marcas registradas e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.

## Licença {#license}

O projeto está licenciado sob a [Licença Apache 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**


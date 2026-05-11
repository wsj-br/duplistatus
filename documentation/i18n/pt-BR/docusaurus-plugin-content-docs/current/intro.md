---
translation_last_updated: '2026-05-11T14:27:42.880Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 18c3808b355ca85cf99e63f258dc6c18f79f738a87a5623a96e332a06ea24ee7
translation_language: pt-BR
source_file_path: documentation/docs/intro.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
  - 'stepfun/step-3.5-flash:free'
---
# Bem-vindo ao duplistatus {#welcome-to-duplistatus}

**duplistatus** - Monitore Múltiplos Servidores do [Duplicati](https://github.com/duplicati/duplicati) de um Único Painel

## Recursos {#features}

- **Configuração Rápida**: Implantação simples em contêiner, com imagens disponíveis no Docker Hub e no GitHub.
- **Painel Unificado**: Visualize status, histórico e detalhes de backups de todos os servidores em um único local.
- **Monitoramento de Backup**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado ao NTFY e e-mail SMTP para alertas de backup, incluindo notificações de backups atrasados.
- **Controle de Acesso e Segurança do Usuário**: Sistema de autenticação seguro com controle de acesso baseado em função (funções Administrador/Usuário), políticas de senha configuráveis, proteção contra bloqueio de conta e gerenciamento completo de usuários.
- **Registro de Auditoria**: Trilha completa de auditoria de todas as alterações no sistema e ações dos usuários, com filtros avançados, capacidade de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs da Aplicação**: Interface exclusiva para administradores visualizar, pesquisar e exportar logs da aplicação diretamente pela interface web, com capacidades de monitoramento em tempo real.
- **Suporte Multilíngue**: Interface e documentação disponíveis em Português, Francês, Alemão, Espanhol e Inglês.

## Instalação {#installation}

O aplicativo pode ser implantado usando Docker, Portainer Stacks ou Podman. 
Ver detalhes no [Guia de Instalação](installation/installation.md).

- Se você está atualizando de uma versão anterior, seu banco de dados será automaticamente
  [migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Ao usar o Podman (seja como um contêiner autônomo ou dentro de um pod), e se você precisar de configurações de DNS personalizadas (como para Tailscale MagicDNS, redes corporativas ou outras configurações de DNS personalizadas), você pode especificar manualmente servidores de DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração de Servidores Duplicati (Obrigatório) {#duplicati-servers-configuration-required}

Uma vez que seu servidor **duplistatus** esteja em funcionamento, você precisa configurar seus servidores **Duplicati** para enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md) do Guia de Instalação. Sem essa configuração, o painel não receberá dados de backup de seus servidores Duplicati.

## Guia do Usuário {#user-guide}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar o **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de tela {#screenshots}

### Painel {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Histórico de backups {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### Detalhes do backup {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### Backups atrasados {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### Notificações atrasadas no seu telefone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## Referência da API {#api-reference}

Consulte a [Documentação de Endpoints da API](api-reference/overview.md) para detalhes sobre endpoints disponíveis, formatos de requisição/resposta e exemplos.

## Desenvolvimento {#development}

Para instruções sobre como baixar, alterar ou executar o código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com ajuda de IA. Para aprender como, consulte [Como Eu Construí Esta Aplicação Usando Ferramentas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- Em primeiro lugar, agradecimentos a Kenneth Skovhede por criar o Duplicati—esta incrível ferramenta de backup. Agradecimentos também a todos os colaboradores.

💙 Se você encontrar [Duplicati](https://www.duplicati.com) útil, considere apoiar o desenvolvedor. Mais detalhes estão disponíveis em seu site ou página do GitHub.

- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati
- Ícone SVG do ntfy de https://dashboardicons.com/icons/ntfy
- Ícone SVG do GitHub de https://github.com/logos

:::note
 Todos os nomes de produtos, logos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::


## Licença {#license}

O projeto está licenciado sob a [Apache License 2.0](LICENSE.md).   

**Copyright © 2026 Waldemar Scudeller Jr.**

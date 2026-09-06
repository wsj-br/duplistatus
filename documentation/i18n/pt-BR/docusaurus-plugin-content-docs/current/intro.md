# Bem-vindo ao duplistatus {#welcome-to-duplistatus}

**duplistatus** - Monitore Múltiplos Servidores do [Duplicati](https://github.com/duplicati/duplicati) de um Único Painel

## Recursos {#features}

- **Configuração Rápida**: Implantação simplificada em contêineres, com imagens disponíveis no Docker Hub e GitHub.
- **Painel Unificado**: Visualize o status, histórico, versão do Duplicati e detalhes de todos os servidores em um só lugar.
- **Monitoramento de Backup**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado a NTFY e SMTP para e-mails de alerta de backup, incluindo notificações de backup atrasado.
- **Controle de Acesso de Usuário e Segurança**: Sistema de autenticação segura com controle de acesso baseado em funções (funções de Administrador/Usuário), políticas de senha configuráveis, proteção contra bloqueio de conta e gerenciamento de usuários abrangente.
- **Chaves de API**: Chaves opcionais com escopo para uploads do Duplicati e widgets do Homepage, além de limites de tamanho e taxa de upload configuráveis.
- **Listas de Permissão de IP**: Listas CIDR separadas para a interface de administração e as APIs externas (`/api/upload`, `/api/summary`, `/api/lastbackup*`).
- **Registro de Auditoria**: Trilha de auditoria completa de todas as alterações do sistema e ações do usuário com filtragem avançada, capacidade de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs do Aplicativo**: Interface apenas para administradores para visualizar, pesquisar e exportar logs do aplicativo diretamente da interface web com capacidades de monitoramento em tempo real.
- **Suporte a Múltiplos Idiomas**: Interface e documentação disponíveis em inglês, francês, alemão, espanhol, português brasileiro, hindi (romano) e chinês simplificado.

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

![painel](assets/screen-main-dashboard-card-mode.png)

### Histórico de backups {#backup-history}

![detalhes-do-servidor](assets/screen-server-backup-list.png)

### Detalhes do backup {#backup-details}

![detalhes-do-backup](assets/screen-backup-detail.png)

### Backups atrasados {#overdue-backups}

![Backups Atrasados](assets/screen-overdue-backup-hover-card.png)

### Notificações atrasadas no seu telefone {#overdue-notifications-on-your-phone}

![mensagem NTFY de atraso](/img/screen-overdue-notification.png)

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
Todos os nomes de produtos, logotipos e marcas registradas são de propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::

## Licença {#license}

O projeto está licenciado sob a [Apache License 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

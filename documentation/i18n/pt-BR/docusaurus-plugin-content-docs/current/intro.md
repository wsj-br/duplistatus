---
translation_last_updated: '2026-01-31T00:51:30.641Z'
source_file_mtime: '2026-01-28T15:01:51.247Z'
source_file_hash: d9d6e23762c8524f
translation_language: pt-BR
source_file_path: intro.md
---
# Bem-vindo ao duplistatus {#welcome-to-duplistatus}

**duplistatus** - Monitore Múltiplos Servidores [Duplicati](https://github.com/duplicati/duplicati) a partir de um Único Painel

## Recursos {#features}

- **Configuração rápida**: Implantação containerizada simples, com imagens disponíveis no Docker Hub e GitHub.
- **Painel unificado**: Visualize o status do backup, histórico e detalhes de todos os servidores em um único lugar.
- **Monitoramento de backups atrasados**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de dados e logs**: Gráficos interativos e coleta automática de logs de servidores Duplicati.
- **Notificações e alertas**: Suporte integrado a NTFY e e-mail SMTP para alertas de backup, incluindo notificações de backups atrasados.
- **Controle de acesso de usuários e segurança**: Sistema de autenticação seguro com controle de acesso baseado em funções (funções Admin/Usuário), políticas de senha configuráveis, proteção contra bloqueio de conta e gerenciamento abrangente de usuários.
- **Registro de auditoria**: Trilha de auditoria completa de todas as alterações do sistema e ações do usuário com filtragem avançada, recursos de exportação e períodos de retenção configuráveis.
- **Visualizador de logs do aplicativo**: Interface exclusiva para administradores para visualizar, pesquisar e exportar logs da aplicação diretamente da interface web com recursos de monitoramento em tempo real.

## Instalação {#installation}

A aplicação pode ser implantada usando Docker, Portainer Stacks ou Podman. 
Consulte os detalhes no [Guia de Instalação](installation/installation.md).

- Se você está atualizando de uma versão anterior, seu banco de dados será automaticamente
[migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Quando usar Podman (seja como um contêiner autônomo ou dentro de um pod), e se você precisar de configurações de DNS personalizadas (como para Tailscale MagicDNS, redes corporativas ou outras configurações de DNS personalizadas), você pode especificar manualmente servidores DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração de Servidores Duplicati (Obrigatório) {#duplicati-servers-configuration-required}

Uma vez que seu servidor **duplistatus** esteja funcionando, você precisa configurar seus servidores **Duplicati** para enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md) do Guia de Instalação. Sem esta configuração, o painel não receberá dados de backup de seus servidores Duplicati.

## Guia do Usuário {#user-guide}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar **duplistatus**, incluindo configuração inicial, configuração de recursos e resolução de problemas.

## Capturas de Tela {#screenshots}

### Painel {#dashboard}

![dashboard](/assets/screen-main-dashboard-card-mode.png)

### Histórico de backups {#backup-history}

![server-detail](/assets/screen-server-backup-list.png)

### Detalhes do backup {#backup-details}

![backup-detail](/assets/screen-backup-detail.png)

### Backups atrasados {#overdue-backups}

![overdue backups](/assets/screen-overdue-backup-hover-card.png)

### Notificações atrasadas no seu telefone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/assets/screen-overdue-notification.png)

## Referência da API {#api-reference}

Consulte a [Documentação de Endpoints da API](api-reference/overview.md) para detalhes sobre endpoints disponíveis, formatos de requisição/resposta e exemplos.

## Desenvolvimento {#development}

Para obter instruções sobre como baixar, alterar ou executar o código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com ajuda de IA. Para aprender como, consulte [Como construí esta aplicação usando ferramentas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- Em primeiro lugar, obrigado a Kenneth Skovhede por criar o Duplicati—esta ferramenta de backup incrível. Obrigado também a todos os contribuidores.

💙 Se você acha o [Duplicati](https://www.duplicati.com) útil, considere apoiar o desenvolvedor. Mais detalhes estão disponíveis no site ou página do GitHub deles.

- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati
- Ícone SVG do Notify de https://dashboardicons.com/icons/ntfy
- Ícone SVG do GitHub de https://github.com/logos

>[!NOTE]
> Todos os nomes de produtos, marcas registradas e marcas comerciais são propriedade de seus respectivos proprietários. Ícones e nomes são utilizados apenas para fins de identificação e não implicam endosso.

## Licença {#license}

O projeto está licenciado sob a [Apache License 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**

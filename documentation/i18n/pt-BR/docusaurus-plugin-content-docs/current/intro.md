---
translation_last_updated: '2026-02-05T19:14:54.389Z'
source_file_mtime: '2026-02-05T19:14:29.160Z'
source_file_hash: 4c9d44bf0a2b2656
translation_language: pt-BR
source_file_path: intro.md
---
# Bem-vindo ao duplistatus {#welcome-to-duplistatus}

**duplistatus** - Monitore Múltiplos Servidores [Duplicati](https://github.com/duplicati/duplicati) a partir de um Único Painel

## Recursos {#features}

- **Configuração Rápida**: Implantação simples em contêiner, com imagens disponíveis no Docker Hub e GitHub.
- **Painel Unificado**: Visualize o status de backup, histórico e detalhes de todos os servidores em um único local.
- **Monitoramento de Backups Atrasados**: Verificação e alertas automatizados para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado a NTFY e e-mail SMTP para alertas de backup, incluindo notificações de backups atrasados.
- **Controle de Acesso de Usuário e Segurança**: Sistema de autenticação seguro com controle de acesso baseado em função (funções Admin/Usuário), políticas de senha configuráveis, proteção de bloqueio de conta e gerenciamento abrangente de usuários.
- **Registro de Auditoria**: Trilha de auditoria completa de todas as mudanças do sistema e ações do usuário com filtragem avançada, recursos de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs do Aplicativo**: Interface exclusiva para administradores para visualizar, pesquisar e exportar logs do aplicativo diretamente da interface web com recursos de monitoramento em tempo real.

## Instalação {#installation}

O aplicativo pode ser implantado usando Docker, Portainer Stacks ou Podman.
Consulte os detalhes no [Guia de Instalação](installation/installation.md).

- Se você estiver atualizando de uma versão anterior, seu banco de dados será automaticamente 
[migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Ao usar Podman (seja como um contêiner independente ou dentro de um pod), e se você precisar de configurações personalizadas de DNS 
(como para Tailscale MagicDNS, redes corporativas ou outras configurações personalizadas de DNS), você pode especificar manualmente 
servidores DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração de Servidores Duplicati (Obrigatório) {#duplicati-servers-configuration-required}

Após iniciar seu servidor **duplistatus**, você precisa configurar seus servidores **Duplicati** para 
enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md) 
do Guia de Instalação. Sem essa configuração, o painel não receberá dados de backup de seus servidores Duplicati.

## Guia do Usuário {#user-guide}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar o **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de Tela {#screenshots}

### Painel {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Histórico de Backups {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### Detalhes do Backup {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### Backups Atrasados {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### Notificações de backups atrasados no seu telefone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## Referência da API {#api-reference}

Consulte a [Documentação de Endpoints da API](api-reference/overview.md) para detalhes sobre endpoints disponíveis, formatos de solicitação/resposta e exemplos.

## Desenvolvimento {#development}

Para instruções sobre download, alteração ou execução do código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com ajuda de IA. Para saber como, consulte [Como Construí esta Aplicação usando Ferramentas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- Primeiramente, obrigado a Kenneth Skovhede por criar o Duplicati—esta incrível ferramenta de backup. Obrigado também a todos os colaboradores.

💙 Se você acha o [Duplicati](https://www.duplicati.com) útil, por favor considere apoiar o desenvolvedor. Mais detalhes estão disponíveis no site ou página do GitHub.

- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati
- Ícone SVG do Notify de https://dashboardicons.com/icons/ntfy
- Ícone SVG do GitHub de https://github.com/logos

>[!Nota]
> Todos os nomes de produtos, logotipos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.

## Licença {#license}

O projeto é licenciado sob a [Licença Apache 2.0](LICENSE.md).

**Direitos Autorais © 2025 Waldemar Scudeller Jr.**

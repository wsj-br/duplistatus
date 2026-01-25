# Bem-vindo ao duplistatus

**duplistatus** - Outro [Painel](https://github.com/duplicati/duplicati) do Duplicati

## Recursos

- **Configuração Rápida**: Implantação simples em contêiner, com imagens disponíveis no Docker Hub e GitHub.
- **Painel Unificado**: Visualize status de backup, histórico e detalhes de todos os servidores em um só lugar.
- **Monitoramento de Atrasos**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado a NTFY e e-mail SMTP para alertas de backup, incluindo notificações de backups atrasados.
- **Controle de Acesso de Usuário e Segurança**: Sistema de autenticação seguro com controle de acesso baseado em funções (funções Admin/Usuário), políticas de senha configuráveis, proteção contra bloqueio de conta e gerenciamento abrangente de usuários.
- **Registro de Auditoria**: Trilha de auditoria completa de todas as alterações do sistema e ações do usuário com filtragem avançada, recursos de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs da Aplicação**: Interface exclusiva para administradores para visualizar, pesquisar e exportar logs da aplicação diretamente da interface web com recursos de monitoramento em tempo real.

## Instalação

A aplicação pode ser implantada usando Docker, Portainer Stacks ou Podman.
Veja detalhes no [Guia de Instalação](installation/installation.md).

- Se você estiver atualizando de uma versão anterior, seu banco de dados será automaticamente
  [migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Ao usar Podman (seja como um contêiner autônomo ou dentro de um pod), e se você precisar de configurações DNS personalizadas
  (como para Tailscale MagicDNS, redes corporativas ou outras configurações DNS personalizadas), você pode especificar manualmente
  servidores DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração dos Servidores Duplicati (Obrigatório)

Assim que seu servidor **duplistatus** estiver funcionando, você precisa configurar seus servidores **Duplicati** para
enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md)
do Guia de Instalação. Sem essa configuração, o painel não receberá dados de backup dos seus servidores Duplicati.

## Guia do Usuário

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar o **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de Tela

### Painel

![painel](/img/screen-main-dashboard-card-mode.png)

### Histórico de Backup

![detalhe-servidor](/img/screen-server-backup-list.png)

### Detalhes do Backup

![detalhe-backup](/img/screen-backup-detail.png)

### Backups Atrasados

![backups atrasados](/img/screen-overdue-backup-hover-card.png)

### Notificações de atrasos no seu telefone

![mensagem ntfy de atraso](/img/screen-overdue-notification.png)

## Referência da API

Consulte a [Documentação dos Endpoints da API](api-reference/overview.md) para detalhes sobre endpoints disponíveis, formatos de solicitação/resposta e exemplos.

## Desenvolvimento

Para instruções sobre como baixar, modificar ou executar o código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com ajuda de IA. Para saber como, consulte [Como Construí esta Aplicação usando ferramentas de IA](development/how-i-build-with-ai).

## Créditos

- Primeiramente, obrigado a Kenneth Skovhede por criar o Duplicati—esta incrível ferramenta de backup. Obrigado também a todos os colaboradores.

  💙 Se você achar o [Duplicati](https://www.duplicati.com) útil, considere apoiar o desenvolvedor. Mais detalhes estão disponíveis no site ou página do GitHub.

- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati

- Ícone SVG do Notify de https://dashboardicons.com/icons/ntfy

- Ícone SVG do GitHub de https://github.com/logos

> [!NOTE]
> Todos os nomes de produtos, marcas comerciais e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.

## Licença

O projeto está licenciado sob a [Licença Apache 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**


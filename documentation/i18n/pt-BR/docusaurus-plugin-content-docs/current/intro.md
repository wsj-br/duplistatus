# Bem-vindo ao duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Monitore Múltiplos [Servidores Duplicati](https://github.com/duplicati/duplicati) a partir de um Único Painel

## Recursos {/* #features */}

- **Configuração Rápida**: Implantação simples em contêiner, com imagens disponíveis no Docker Hub e GitHub.
- **Painel Unificado**: Visualize status de backup, histórico, versão do Duplicati e detalhes de todos os servidores em um único lugar.
- **Monitoramento de Backup**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado a NTFY e E-mail SMTP para alertas de backup, incluindo notificações de backup atrasado.
- **Gerenciamento de Usuários**: Login com funções de Administrador e Usuário, políticas de senha configuráveis, bloqueio de conta e administração de usuários.
- **Reforço de Segurança**: Proteção extra opcional, Chaves de API para carregamentos do Duplicati e widgets da página inicial (com limites de tamanho e taxa de carregamento), listas de permissão de IP independentes para a Interface de administração e as APIs externas, proteção contra falsificação e orientações para proxy reverso HTTPS.
- **Registro de Auditoria**: Trilha de auditoria completa de todas as alterações do sistema e ações do usuário com filtragem avançada, recursos de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs do Aplicativo**: Interface exclusiva para administrador para visualizar, pesquisar e exportar logs do aplicativo diretamente da interface web com capacidades de monitoramento em tempo real.
- **Suporte Multilíngue**: Interface e documentação disponíveis em inglês, francês, alemão, espanhol, português brasileiro, hindi e chinês simplificado.

## Instalação {/* #installation */}

O aplicativo pode ser implantado usando Docker, Portainer Stacks ou Podman.
Veja detalhes no [Guia de Instalação](installation/installation.md).

- Se você estiver atualizando de uma versão anterior, seu banco de dados será automaticamente
  [migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Ao usar Podman (como um contêiner autônomo ou dentro de um pod), e se você precisar de configurações de DNS personalizadas
(como para Tailscale MagicDNS, redes corporativas ou outras configurações de DNS personalizadas), você pode especificar manualmente
servidores DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração de Servidores Duplicati (obrigatório) {/* #duplicati-servers-configuration-required */}

Depois que seu servidor **duplistatus** estiver ativo e funcionando, você precisa configurar seus servidores **Duplicati** para
enviar logs de backup para **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md)
do Guia de Instalação. Sem essa configuração, o painel não receberá dados de backup de seus servidores Duplicati.

## Guia do Usuário {/* #user-guide */}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de Tela {/* #screenshots */}

### Painel {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Histórico de Backup {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Detalhes de Backup {/* #backup-details */}

![detalhes-do-backup](assets/screen-backup-detail.png)

### Backups Atrasados {/* #overdue-backups */}

![backups atrasados](assets/screen-overdue-backup-hover-card.png)

### Notificações atrasadas no seu telefone {/* #overdue-notifications-on-your-phone */}

![mensagem atrasada do ntfy](/img/screen-overdue-notification.png)

## Referência de API {/* #api-reference */}

Consulte a [Documentação de Endpoints de API](api-reference/overview.md) para detalhes sobre endpoints disponíveis, formatos de solicitação/resposta e exemplos.

## Desenvolvimento {/* #development */}

Para instruções sobre como baixar, modificar ou executar o código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi construído principalmente com ajuda de IA. Para saber como, consulte [Como Construo esta Aplicação usando Ferramentas de IA](development/how-i-build-with-ai).

## Créditos {/* #credits */}

- Em primeiro lugar, obrigado a Kenneth Skovhede por criar o Duplicati—esta ferramenta de backup incrível. Obrigado também a todos os contribuidores.

💙 Se você achar [Duplicati](https://www.duplicati.com) útil, considere apoiar o desenvolvedor. Mais detalhes estão disponíveis no site ou página do GitHub deles.

- Ideia/implementação de Chaves de API e Listas de Permissão de IP por `henmohr` na issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati
- Ícone SVG do ntfy de https://dashboardicons.com/icons/ntfy
- Ícone SVG do GitHub de https://github.com/logos

:::note
 Todos os nomes de produtos, logos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::

## Licença {/* #license */}

O projeto é licenciado sob a [Licença Apache 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Nota sobre traduções de interface e documentação:** Todos os idiomas de interface e documentação, exceto English (UK), foram traduzidos com IA usando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) e a redação pode ser imprecisa ou conter erros.

</small>

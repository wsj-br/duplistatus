# Bem-vindo ao duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Monitore Múltiplos Servidores [Duplicati](https://github.com/duplicati/duplicati) a partir de um Único Painel

## Recursos {/* #features */}

- **Configuração Rápida**: Implantação simplificada em contêineres, com imagens disponíveis no Docker Hub e GitHub.
- **Painel Unificado**: Visualize o status, histórico, versão do Duplicati e detalhes de todos os servidores em um só lugar.
- **Monitoramento de Backup**: Verificação automatizada e alertas para backups agendados atrasados.
- **Visualização de Dados e Logs**: Gráficos interativos e coleta automática de logs dos servidores Duplicati.
- **Notificações e Alertas**: Suporte integrado a NTFY e e-mail SMTP para alertas de backup, incluindo notificações de backups atrasados.
- **Gerenciamento de Usuários**: Login com funções de Administrador e Usuário, políticas de senha configuráveis, bloqueio de conta e administração de usuários.
- **Proteção de Segurança**: Proteção extra opcional, chaves de API para uploads do Duplicati e widgets do Homepage (com limites de tamanho e taxa de upload), listas de permissões de IP independentes para a interface de administração e as APIs externas, proteção contra spoofing e orientação de proxy reverso HTTPS.
- **Registro de Auditoria**: Trilha completa de todas as alterações do sistema e ações dos usuários com filtros avançados, capacidades de exportação e períodos de retenção configuráveis.
- **Visualizador de Logs do Aplicativo**: Interface exclusiva para administradores para visualizar, pesquisar e exportar logs do aplicativo diretamente da interface web com capacidades de monitoramento em tempo real.
- **Suporte a Múltiplos Idiomas**: Interface e documentação disponíveis em inglês, francês, alemão, espanhol, português brasileiro, hindi e chinês simplificado.

## Instalação {/* #installation */}

O aplicativo pode ser implantado usando Docker, Portainer Stacks ou Podman. 
Consulte os detalhes no [Guia de Instalação](installation/installation.md).

- Se você estiver atualizando de uma versão anterior, seu banco de dados será automaticamente
  [migrado](migration/version_upgrade.md) para o novo esquema durante o processo de atualização.

- Ao usar Podman (como contêiner standalone ou dentro de um pod), e se você precisar de configurações DNS personalizadas 
(como para Tailscale MagicDNS, redes corporativas ou outras configurações DNS personalizadas), você pode especificar manualmente 
servidores DNS e domínios de pesquisa. Consulte o guia de instalação para mais detalhes.

## Configuração de Servidores Duplicati (Obrigatório) {/* #duplicati-servers-configuration-required */}

Depois que seu servidor **duplistatus** estiver em execução, você precisará configurar seus servidores **Duplicati** para 
enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](installation/duplicati-server-configuration.md) 
do Guia de Instalação. Sem essa configuração, o painel não receberá dados de backup dos seus servidores Duplicati.

## Guia do Usuário {/* #user-guide */}

Consulte o [Guia do Usuário](user-guide/overview.md) para instruções detalhadas sobre como configurar e usar o **duplistatus**, incluindo configuração inicial, configuração de recursos e solução de problemas.

## Capturas de Tela {/* #screenshots */}

### Painel {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Histórico de Backup {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Detalhes do Backup {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Backups Atrasados {/* #overdue-backups */}

![backups atrasados](assets/screen-overdue-backup-hover-card.png)

### Notificações de atraso no seu celular {/* #overdue-notifications-on-your-phone */}

![mensagem de atraso ntfy](/img/screen-overdue-notification.png)

## Referência de API {/* #api-reference */}

Consulte a [Documentação de Pontos de Extremidade da API](api-reference/overview.md) para obter detalhes sobre os pontos de extremidade disponíveis, formatos de solicitação/resposta e exemplos.

## Desenvolvimento {/* #development */}

Para instruções sobre como baixar, alterar ou executar o código, consulte [Configuração de Desenvolvimento](development/setup.md).

Este projeto foi principalmente construído com ajuda de IA. Para saber como, consulte [Como Construí Este Aplicativo Usando Ferramentas de IA](development/how-i-build-with-ai).

## Créditos {/* #credits */}

- Em primeiro lugar, agradeço a Kenneth Skovhede por criar o Duplicati—esta incrível ferramenta de backup. Agradeço também a todos os contribuidores.

💙 Se você achar o [Duplicati](https://www.duplicati.com) útil, por favor, considere apoiar o desenvolvedor. Mais detalhes estão disponíveis no site deles ou na página do GitHub.

- Ideia/implementação de Chaves de API e Lista de Permissão de IP por `henmohr` na issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Ícone SVG do Duplicati de https://dashboardicons.com/icons/duplicati
- Ícone SVG do ntfy de https://dashboardicons.com/icons/ntfy
- Ícone SVG do GitHub de https://github.com/logos

:::note
 Todos os nomes de produtos, logotipos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::

## Licença {/* #license */}

O projeto está licenciado sob a [Licença Apache 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Nota sobre traduções de interface e documentação:** Todos os idiomas de interface e documentação, exceto o inglês (Reino Unido), foram traduzidos com IA usando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); a terminologia pode ser imprecisa ou conter erros.

</small>

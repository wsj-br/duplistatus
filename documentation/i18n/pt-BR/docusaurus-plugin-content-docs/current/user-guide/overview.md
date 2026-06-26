# Visão Geral {#overview}

Bem-vindo ao guia do usuário duplistatus. Este documento abrangente fornece instruções detalhadas para usar duplistatus a fim de monitorar e gerenciar suas operações de backup do Duplicati em múltiplos servidores.

## O que é duplistatus? {#what-is-duplistatus}

duplistatus é um poderoso painel de monitoramento projetado especificamente para sistemas de backup Duplicati. Ele fornece:

- Monitoramento centralizado de múltiplos servidores Duplicati a partir de uma única interface
- Rastreamento em tempo real do status de todas as operações de backup
- Detecção automatizada de backups atrasados com alertas configuráveis
- Métricas abrangentes e visualização do desempenho do backup
- Sistema de notificação flexível via NTFY e E-mail
- Suporte multilíngue (Inglês, Francês, Alemão, Espanhol, Português do Brasil, Hindi (Romano) e Chinês Simplificado).

## Instalação {#installation}

Para pré-requisitos e instruções detalhadas de instalação, consulte o [Guia de Instalação](../installation/installation.md).

## Acessando o Painel {#accessing-the-dashboard}

Após a instalação bem-sucedida, acesse a interface web do duplistatus seguindo estas etapas:

1. Abra seu navegador web preferido
2. Acesse `http://your-server-ip:9666`
   - Substitua `your-server-ip` pelo endereço IP ou nome do host real do seu servidor duplistatus
   - A porta padrão é `9666`
3. Você será direcionado para uma página de login.

Use estas credenciais para o primeiro uso (ou após uma atualização de versões anteriores a 0.9.x):
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Selecione o idioma da interface do usuário no canto superior direito <IconButton icon="lucide:languages" label="Idioma" />, ou em <IconButton icon="lucide:user" label="nome de usuário" /> após o login (veja abaixo).

4. Após o login, o painel principal será exibido automaticamente (sem dados no primeiro uso)

## Visão Geral da Interface do Usuário {#user-interface-overview}

duplistatus fornece um painel intuitivo para monitorar operações de backup do Duplicati em toda sua infraestrutura.

![Dashboard Overview](../assets/screen-main-dashboard-card-mode.png)

A interface do usuário é organizada em várias seções principais para proporcionar uma experiência de monitoramento clara e abrangente:

1. [Barra de ferramentas do aplicativo](#application-toolbar): Acesso rápido às funções e configurações essenciais
2. [Resumo do painel](dashboard.md#dashboard-summary): Estatísticas gerais para todos os servidores monitorados
3. Visão geral dos servidores: [layout em cartões](dashboard.md#cards-layout) ou [layout em tabela](dashboard.md#table-layout) mostrando o status mais recente de todos os backups
4. [Detalhes de atraso](dashboard.md#overdue-details): Avisos visuais para backups atrasados com informações detalhadas ao passar o mouse
5. [Versões de backup disponíveis](dashboard.md#available-backup-versions): Clique no ícone azul para visualizar as versões de backup disponíveis no destino
6. [Métricas de backup](backup-metrics.md): Gráficos interativos que exibem o desempenho do backup ao longo do tempo
7. [Detalhes do servidor](server-details.md): Lista completa dos backups registrados para servidores específicos, incluindo estatísticas detalhadas
8. [Detalhes do backup](server-details.md#backup-details): Informações detalhadas sobre backups individuais, incluindo logs de execução, avisos e erros

## Barra de Ferramentas da Aplicação {#application-toolbar}

A barra de ferramentas da aplicação fornece acesso conveniente às funções e configurações principais, organizada para um fluxo de trabalho eficiente.

![Application toolbar](../assets/duplistatus_toolbar.svg)

| Botão                                                                                                                                           | Descrição                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; Filtrar                                                                                            | Pesquisar e filtrar servidores por ID, URL ou nome do trabalho de backup.                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Atualizar tela                                                                                    | Executar uma atualização manual imediata de todos os dados                                                                                                                                     |
| <IconButton label="Atualização automática" />                                                                                                              | Ativa ou desativa a função de atualização automática. Configure em [Configurações de Exibição](settings/display-settings.md) <br/> _Clique com o botão direito_ para abrir a página de Configurações de Exibição           |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; Abrir NTFY                                                                                            | Acessa o site ntfy.sh para o tópico de notificação configurado. <br/> _Clique com o botão direito_ para exibir um código QR para configurar seu dispositivo e receber notificações do duplistatus. |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Configuração do Duplicati](duplicati-configuration.md)       | Abre a interface web do servidor Duplicati selecionado <br/> _Clique com o botão direito_ para abrir a interface legada do Duplicati (`/ngax`) em uma nova aba                                                                                                                           |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Coletar logs](collect-backup-logs.md)                                   | Conecta-se aos servidores Duplicati e recupera os logs de backup <br/> _Clique com o botão direito_ para coletar logs de todos os servidores configurados                                                         |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Configurações](settings/backup-notifications-settings.md) | Configura notificações, monitoramento, servidor SMTP e modelos de notificação                                                                                                 |
| <IconButton icon="lucide:user" label="nome de usuário" />                                                                                               | Mostrar o usuário conectado, tipo de usuário (`Admin`, `User`), clique para abrir o menu do usuário (inclui seleção de idioma). Veja mais em [Gerenciamento de Usuários](settings/user-management-settings.md)                               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Guia do Usuário                                                                    | Abrir o [Guia do Usuário](overview.md) na seção relevante à página que você está visualizando no momento. A dica de ferramenta mostra "Ajuda para [Nome da Página]" para indicar qual documentação será aberta.                                                                           |

### Menu do Usuário {#user-menu}

Clicar no botão de usuário abre um menu suspenso com opções específicas do usuário. As opções do menu diferem dependendo se você está conectado como um administrador ou um usuário comum. Ambos os papéis podem alterar o idioma da interface pelo submenu **Idioma**. Idiomas suportados: Inglês, Francês, Alemão, Espanhol, Português do Brasil, Hindi (Romano) e Chinês Simplificado.

<table>
  <tr>
    <th>Admin</th>
    <th>Usuário Regular</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Menu do Usuário - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Menu do Usuário - Usuário](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Configuração Essencial {#essential-configuration}

1. Configure seus [servidores Duplicati](../installation/duplicati-server-configuration.md) para enviar mensagens de log de backup para o duplistatus (obrigatório).
2. Colete os logs iniciais de backup – use o recurso [Coletar Logs de Backup](collect-backup-logs.md) para preencher o banco de dados com dados históricos de backup de todos os seus servidores Duplicati. Isso também atualiza automaticamente os intervalos de monitoramento de backup com base na configuração de cada servidor.
3. Configure as configurações do servidor – defina apelidos e anotações dos servidores em [Configurações → Servidor](settings/server-settings.md) para tornar seu painel mais informativo.
4. Configure as configurações do NTFY – configure notificações via NTFY em [Configurações → NTFY](settings/ntfy-settings.md).
5. Configure as configurações de e-mail – configure notificações por e-mail em [Configurações → E-mail](settings/email-settings.md).
6. Configure as notificações de backup – configure notificações por backup ou por servidor em [Configurações → Notificações de Backup](settings/backup-notifications-settings.md).

<br/>

:::info[IMPORTANTE]
Lembre-se de configurar os servidores Duplicati para enviar logs de backup para duplistatus, conforme descrito na seção [Configuração do Duplicati](../installation/duplicati-server-configuration.md).
:::

<br/>

:::note
Todos os nomes de produtos, logotipos e marcas registradas são de propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::

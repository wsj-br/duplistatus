# Visão Geral {/* #overview */}

Bem-vindo ao guia do usuário do duplistatus. Este documento abrangente fornece instruções detalhadas para usar o duplistatus para monitorar e gerenciar suas operações de backup do Duplicati em vários servidores.

## O que é o duplistatus? {/* #what-is-duplistatus */}

O duplistatus é um painel de monitoramento poderoso projetado especificamente para sistemas de backup do Duplicati. Ele fornece:

- Monitoramento centralizado de vários servidores Duplicati a partir de uma única interface
- Rastreamento em tempo real do status de todas as operações de backup
- Detecção automatizada de backups atrasados com alertas configuráveis
- Métricas e visualização abrangentes do desempenho do backup
- Sistema de notificação flexível via NTFY e e-mail
- Recursos opcionais de [hardening de segurança](../installation/security-hardening.md)
- Suporte a múltiplos idiomas (inglês, francês, alemão, espanhol, português brasileiro, hindi e chinês simplificado).

## Instalação {/* #installation */}

Para pré-requisitos e instruções de instalação detalhadas, consulte o [Guia de Instalação](../installation/installation.md).

## Acessando o Painel {/* #accessing-the-dashboard */}

Após a instalação bem-sucedida, acesse a interface web do duplistatus seguindo estas etapas:

1. Abra seu navegador web preferido
2. Navegue até `http://your-server-ip:9666`
   - Substitua `your-server-ip` pelo endereço IP ou nome do host real do seu servidor duplistatus
   - A porta padrão é `9666`
3. Você será apresentado a uma página de login.

Use estas credenciais para o primeiro uso (ou após uma atualização de versões pré-0.9.x):
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Selecione o idioma da interface do usuário no canto superior direito <IconButton icon="lucide:languages" label="Idioma" />, ou em <IconButton icon="lucide:user" label="nome de usuário" /> após o login (veja abaixo).

4. Após o login, o painel principal será exibido automaticamente (sem dados no primeiro uso)

## Visão Geral da Interface do Usuário {/* #user-interface-overview */}

O duplistatus fornece um painel intuitivo para monitorar operações de backup do Duplicati em toda a sua infraestrutura.

![Visão Geral do Painel](../assets/screen-main-dashboard-card-mode.png)

A interface do usuário é organizada em várias seções-chave para fornecer uma experiência de monitoramento clara e abrangente:

1. [Barra de Ferramentas do Aplicativo](#application-toolbar): Acesso rápido a funções e configurações essenciais
2. [Resumo do Painel](dashboard.md#dashboard-summary): Estatísticas gerais para todos os servidores monitorados
3. Visão Geral dos Servidores: [Layout de cards](dashboard.md#cards-layout) ou [layout de tabela](dashboard.md#table-layout) mostrando o status mais recente de todos os backups, incluindo a [versão do servidor Duplicati](dashboard.md#duplicati-server-version) do último log de backup recebido
4. [Detalhes do Atraso](dashboard.md#overdue-details): Avisos visuais para backups atrasados com informações detalhadas ao passar o mouse
5. [Versões de Backup Disponíveis](dashboard.md#available-backup-versions): Clique no ícone azul para visualizar as versões de backup disponíveis no destino
6. [Métricas de Backup](backup-metrics.md): Gráficos interativos exibindo o desempenho do backup ao longo do tempo
7. [Detalhes do Servidor](server-details.md): Lista abrangente de backups registrados para servidores específicos, incluindo estatísticas detalhadas
8. [Detalhes do Backup](server-details.md#backup-details): Informações detalhadas para backups individuais, incluindo logs de execução, avisos e erros

## Barra de Ferramentas da Aplicação {/* #application-toolbar */}

A barra de ferramentas da aplicação fornece acesso conveniente a funções e configurações-chave, organizadas para um fluxo de trabalho eficiente.

![Barra de ferramentas da aplicação](../assets/duplistatus_toolbar.svg)

| Botão                                                                                                                                           | Descrição                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; Filtro                                                                                            | Pesquisar e filtrar servidores por ID, URL ou nome do trabalho de backup.                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Atualizar tela                                                                                    | Executar uma atualização manual imediata de todos os dados                                                                                                                                     |
| <IconButton label="Atualização automática" />                                                                                                              | Ativar ou desativar a funcionalidade de atualização automática. Configurar em [Configurações de Exibição](settings/display-settings.md) <br/> _Clique com o botão direito_ para abrir a página de Configurações de Exibição                         |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; Abrir NTFY                                                                                            | Acessar o site ntfy.sh para o tópico de notificação configurado. <br/> _Clique com o botão direito_ para mostrar um código QR para configurar seu dispositivo para receber notificações do duplistatus.               |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Configuração do Duplicati](duplicati-configuration.md)       | Abrir a interface web do servidor Duplicati selecionado <br/> _Clique com o botão direito_ para abrir a interface legada do Duplicati (`/ngax`) em uma nova guia                                                              |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Coletar logs](collect-backup-logs.md)                                   | Conectar-se aos servidores Duplicati e recuperar logs de backup <br/> _Clique com o botão direito_ para coletar logs de todos os servidores configurados                                                                       |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Configurações](settings/backup-notifications-settings.md) | Configurar notificações, monitoramento, servidor SMTP e modelos de notificação                                                                                                               |
| <IconButton icon="lucide:user" label="nome de usuário" />                                                                                               | Mostrar o usuário conectado, tipo de usuário (`Admin`, `User`), clique para o menu do usuário (inclui seleção de idioma). Veja mais em [Gerenciamento de Usuários](settings/user-management-settings.md)               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Guia do Usuário                                                                    | Abrir a [Guia do Usuário](overview.md) para a seção relevante à página que você está visualizando atualmente. A dica de ferramenta mostra "Ajuda para [Nome da Página]" para indicar qual documentação será aberta. |

### Menu do Usuário {/* #user-menu */}

Clicar no botão do usuário abre um menu suspenso com opções específicas do usuário. As opções do menu diferem dependendo de você estar logado como administrador ou usuário regular. Ambos os papéis podem alterar o idioma da interface por meio do submenu **Idioma**. O idioma selecionado é salvo por usuário neste navegador (não como uma configuração global do sistema), então diferentes contas podem manter diferentes idiomas. Idiomas suportados: Inglês, Francês, Alemão, Espanhol, Português Brasileiro, Hindi e Chinês Simplificado.

<table>
  <tr>
    <th>Administrador</th>
    <th>Usuário Regular</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Menu do Usuário - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Menu do Usuário - Usuário](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Configuração Essencial {/* #essential-configuration */}

1. Configure seus [servidores Duplicati](../installation/duplicati-server-configuration.md) para enviar mensagens de log de backup para o duplistatus (obrigatório).
2. Coletar logs de backup iniciais – use o recurso [Coletar Logs de Backup](collect-backup-logs.md) para popular o banco de dados com dados históricos de backup de todos os seus servidores Duplicati. Isso também atualiza automaticamente os intervalos de monitoramento de backup com base na configuração de cada servidor.
3. Configurar definições do servidor – configure aliases e notas do servidor em [Configurações → Servidor](settings/server-settings.md) para tornar seu painel mais informativo.
4. Configurar definições do NTFY – configure notificações via NTFY em [Configurações → NTFY](settings/ntfy-settings.md).
5. Configurar definições de e-mail – configure notificações por e-mail em [Configurações → E-mail](settings/email-settings.md).
6. Configurar notificações de backup – configure notificações por backup ou por servidor em [Configurações → Notificações de Backup](settings/backup-notifications-settings.md).
7. Opcionalmente, restrinja o acesso – crie [chaves de API](settings/api-keys-settings.md) e/ou [listas de permissões de IP](settings/ip-allowlist-settings.md) se desejar proteger `/api/upload` e a interface de administração. Ambos estão desativados por padrão.

<br/>

:::info[IMPORTANTE]
Lembre-se de configurar os servidores Duplicati para enviar logs de backup para o duplistatus, conforme descrito na seção [Configuração do Duplicati](../installation/duplicati-server-configuration.md).
:::

<br/>

:::note
 Todos os nomes de produtos, logotipos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::

<small>

> **Nota sobre traduções de interface e documentação:** Todos os idiomas de interface e documentação, exceto o inglês (Reino Unido), foram traduzidos com IA usando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); a terminologia pode ser imprecisa ou conter erros.

</small>

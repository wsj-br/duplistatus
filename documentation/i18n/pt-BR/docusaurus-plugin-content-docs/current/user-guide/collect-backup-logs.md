# Coletar Logs de Backup {/* #collect-backup-logs */}

**duplistatus** pode recuperar logs de backup diretamente dos servidores Duplicati para popular o banco de dados ou restaurar dados de logs ausentes. O aplicativo automaticamente ignora quaisquer logs duplicados que já existem no banco de dados.

## Passos para Coletar Logs de Backup {/* #steps-to-collect-backup-logs */}

### Coleta Manual {/* #manual-collection */}

1. Clique no ícone **Coletar Logs de Backup** <IconButton icon="lucide:download" /> na barra de ferramentas do aplicativo [Application Toolbar](overview.md#application-toolbar).

![Popup de Coletar Logs de Backup](../assets/screen-collect-button-popup.png)

2. Selecionar Servidor

Se você tiver endereços de servidores configurados em [Configurações → Configurações do Servidor](settings/server-settings.md), selecione um da lista suspensa para coleta instantânea. Se você não tiver nenhum servidor configurado, você pode inserir os detalhes do servidor Duplicati manualmente.

3. Insira os detalhes do servidor Duplicati:
    - **Nome do host**: O nome do host ou endereço IP do servidor Duplicati. Você pode inserir múltiplos nomes de host separados por vírgulas, por exemplo `192.168.1.23,someserver.local,192.168.1.89`
    - **Porta**: O número da porta usada pelo servidor Duplicati (padrão: `8200`).
    - **Senha**: Insira a senha de autenticação, se necessário.
    - **Baixar dados JSON coletados**: Ative esta opção para baixar os dados coletados pelo duplistatus.
4. Clique em **Coletar Backups**.

***Notas:***
- Se você inserir múltiplos nomes de host, a coleta será realizada usando a mesma porta e senha para todos os servidores.
- **duplistatus** detectará automaticamente o melhor protocolo de conexão (HTTPS ou HTTP). Ele tenta HTTPS primeiro (com validação SSL adequada), depois HTTPS com certificados autoassinados e, finalmente, HTTP como fallback.

:::tip
<IconButton icon="lucide:download" /> botões estão disponíveis em [Configurações → Monitoramento de Backup](settings/backup-monitoring-settings.md) e [Configurações → Configurações do Servidor](settings/server-settings.md) para coleta em servidor único.
:::

<br/>

### Coleta em Massa {/* #bulk-collection */}

_Clique com o botão direito_ no botão **Coletar Logs de Backup** <IconButton icon="lucide:download" /> na barra de ferramentas do aplicativo para coletar de todos os servidores configurados.

![Menu de Clique com o Botão Direito Coletar Tudo](../assets/screen-collect-button-right-click-popup.png)

:::tip
Você também pode usar o botão <IconButton icon="lucide:import" label="Coletar Todos"/> nas páginas [Configurações → Monitoramento de Backup](settings/backup-monitoring-settings.md) e [Configurações → Configurações do Servidor](settings/server-settings.md) para coletar de todos os servidores configurados.
:::

## Como o Processo de Coleta Funciona {/* #how-the-collection-process-works */}

- **duplistatus** detecta automaticamente o melhor protocolo de conexão e se conecta ao servidor Duplicati especificado.
- Ele recupera o histórico de backup, informações de log e configurações de backup (para monitoramento de backup).
- Qualquer log já presente no banco de dados do **duplistatus** é ignorado.
- Novos dados são processados e armazenados no banco de dados local, incluindo a versão do Duplicati relatada em cada log de backup. A [versão do painel](dashboard.md#duplicati-server-version) é tirada do log mais recente armazenado — **duplistatus** não lê a versão que está atualmente em execução no servidor. Após uma atualização do Duplicati, colete ou espere por um novo backup para que o painel possa mostrar a nova versão.
- A URL usada (com o protocolo detectado) será armazenada ou atualizada no banco de dados local.
- Se a opção de download for selecionada, ela baixará os dados JSON coletados sempre que qualquer dado for recebido do servidor Duplicati — mesmo se os logs falharem na validação ou não puderem ser importados para o banco de dados. O nome do arquivo será neste formato: `[serverName]_collected_[Timestamp].json`. O timestamp usa o formato de data ISO 8601 (YYYY-MM-DDTHH:MM:SS).
- O painel é atualizado para refletir as novas informações.

:::note Vendo servidores duplicados após coletar?
Se o mesmo servidor aparecer mais de uma vez após coletar logs de backup (ou após uma reinstalação/atualização do Duplicati), isso geralmente é causado por uma mudança no `machine_id` ou por um bug da API do Duplicati que mistura o `identity` id e o `machine_id`. A solução é alinhar os ids no servidor Duplicati (edite `identity.txt`/`machineid.txt` ou defina **Duplicati → Configurações → Opções Avançadas → Machine-id**), reinicie o Duplicati e, em seguida, mescle as entradas no **duplistatus** via [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers). Veja [Servidores Duplicados no Painel](troubleshooting.md#duplicate-servers-on-the-dashboard) para os passos completos.
:::

## Solução de Problemas de Coleta {/* #troubleshooting-collection-issues */}

A coleta de logs de backup requer que o servidor Duplicati esteja acessível a partir da instalação do **duplistatus**. Se você encontrar problemas, verifique o seguinte:

- Confirme se o nome do host (ou endereço IP) e o número da porta estão corretos. Você pode testar isso acessando a interface do usuário do servidor Duplicati no seu navegador (por exemplo, `http://hostname:port`).
- Verifique se o **duplistatus** pode se conectar ao servidor Duplicati. Um problema comum é a resolução de nomes DNS (o sistema não consegue encontrar o servidor pelo seu nome do host). Veja mais na [seção de solução de problemas](troubleshooting.md#collect-backup-logs-not-working).
- Certifique-se de que a senha fornecida está correta.
- No Duplicati 2.4+, a coleta lê o ID da máquina das configurações do servidor Duplicati quando a opção padrão do systeminfo está vazia.

---
translation_last_updated: '2026-02-05T00:21:14.252Z'
source_file_mtime: '2026-01-31T00:23:03.813Z'
source_file_hash: ccb921e081ad2c50
translation_language: pt-BR
source_file_path: user-guide/troubleshooting.md
---
# Solução de Problemas {#troubleshooting}

### Painel Não Carregando {#dashboard-not-loading}
- Verificar se o container está em execução: `docker ps`
- Verificar se a porta 9666 está acessível
- Verificar logs do container: `docker logs duplistatus`

### Não há dados de backup {#no-backup-data}
- Verificar configuração do servidor Duplicati
- Verificar conectividade de rede entre servidores
- Revisar logs do duplistatus para erros
- Garantir que os trabalhos de backup estejam em execução

### Notificações Não Funcionando {#notifications-not-working}
- Verificar configuração de notificação
- Verificar conectividade do servidor NTFY (se estiver usando NTFY)
- Testar Configurações de Notificação
- Verificar logs de notificação

### Novos Backups Não Aparecem {#new-backups-not-showing}

Se você vir avisos do servidor Duplicati como `HTTP Response request failed for:` e `Failed to send message: System.Net.Http.HttpRequestException:`, e novos backups não aparecerem no Painel ou no Histórico de backups:

- **Verificar Configuração do Duplicati**: Confirmar que o Duplicati está configurado corretamente para enviar dados para **duplistatus**. Verificar as configurações de URL HTTP no Duplicati.
- **Verificar Conectividade de Rede**: Garantir que o servidor Duplicati possa se conectar ao servidor **duplistatus**. Confirmar que a porta está correta (padrão: `9666`).
- **Revisar Logs do Duplicati**: Verificar erros de requisição HTTP nos logs do Duplicati.

### Notificações Não Funcionando (Detalhado) {#notifications-not-working-detailed}

Se as notificações não estão sendo enviadas ou recebidas:

- **Verificar Configuração NTFY**: Certifique-se de que a URL NTFY e o tópico estão corretos. Use o botão `Send Test Notification` para testar.
- **Verificar Conectividade de Rede**: Verifique se **duplistatus** consegue alcançar seu servidor NTFY. Revise as configurações de firewall, se aplicável.
- **Verificar Configurações de Notificação**: Confirme que as notificações estão habilitadas para os backups relevantes.

### Versões disponíveis não aparecem {#available-versions-not-appearing}

Se as versões de backup não forem exibidas no Painel ou na página de Detalhes:

- **Verificar Configuração do Duplicati**: Certifique-se de que `send-http-log-level=Information` e `send-http-max-log-lines=0` estão configurados nas opções avançadas do Duplicati.

### Alertas de Backup Atrasado Não Funcionando {#overdue-backup-alerts-not-working}

Se as notificações de backup atrasado não estão sendo enviadas:

- **Verificar Configuração de Atrasos**: Confirmar que o monitoramento de backups atrasados está habilitado para o backup. Verificar o intervalo esperado e as configurações de tolerância.
- **Verificar Frequência de Notificações**: Se definido como `One time`, alertas são enviados apenas uma vez por evento de atraso.
- **Verificar Serviço Cron**: Garantir que o serviço cron que monitora backups atrasados está funcionando corretamente. Verificar os logs da aplicação para erros. Verificar se o serviço cron está acessível na porta configurada (padrão: `8667`).

### Coletar logs de backup não está funcionando {#collect-backup-logs-not-working}

Se a coleta manual do log de backup falhar:

- **Verificar Acesso ao Servidor Duplicati**: Verifique se o nome do host e a porta do servidor Duplicati estão corretos. Confirme se o acesso remoto está habilitado no Duplicati. Garanta que a senha de autenticação está correta.
- **Verificar Conectividade de Rede**: Teste a conectividade do **duplistatus** para o servidor Duplicati. Confirme se a porta do servidor Duplicati está acessível (padrão: `8200`).
  Por exemplo, se você está usando Docker, pode usar `docker exec -it <container-name> /bin/sh` para acessar a linha de comando do container e executar ferramentas de rede como `ping` e `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Verifique também a configuração de DNS dentro do container (veja mais em [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

### Atualizar de uma versão anterior (antes de 0.9.x) e não conseguir fazer login {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** desde a versão 0.9.x requer autenticação de usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior:
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Você pode criar contas de usuários adicionais em [Configurações > Usuários](settings/user-management-settings.md) após o primeiro login.

### Senha de Admin Perdida ou Bloqueado {#lost-admin-password-or-locked-out}

Se você perdeu sua senha de administrador ou foi bloqueado de sua conta:

- **Use Admin Recovery Script**: Consulte o guia [Admin Account Recovery](admin-recovery.md) para obter instruções sobre como recuperar o acesso de administrador em ambientes Docker.
- **Verify Container Access**: Certifique-se de que você tem acesso Docker exec ao contêiner para executar o script de recuperação.

### Backup do banco de dados e Migração {#database-backup-and-migration}

Quando migrar de versões anteriores ou criar um backup do banco de dados:

**Se você está executando a versão 1.2.1 ou posterior:**
- Use a função de backup do banco de dados integrada em `Configurações → Manutenção do banco de dados`
- Selecione seu formato preferido (.db ou .sql) e clique em `Download Backup`
- O arquivo de backup será baixado para seu computador
- Consulte [Manutenção do banco de dados](settings/database-maintenance.md#database-backup) para instruções detalhadas

**Se você está executando uma versão anterior à 1.2.1:**
- Você precisará fazer um backup manual. Consulte o [Guia de Migração](../migration/version_upgrade.md#backing-up-your-database-before-migration) para mais informações.

Se você ainda tiver problemas, tente as seguintes etapas:

1.  **Inspecione os Logs da Aplicação**: Se estiver usando Docker, execute `docker logs <container-name>` para revisar informações detalhadas de erro.
2.  **Valide as Configurações**: Verifique novamente todas as configurações na sua ferramenta de gerenciamento de contêiner (Docker, Portainer, Podman, etc.) incluindo portas, rede e permissões.
3.  **Verifique a Conectividade de Rede**: Confirme que todas as conexões de rede estão estáveis.
4.  **Verifique o Serviço Cron**: Certifique-se de que o serviço cron está sendo executado junto com a aplicação principal. Verifique os logs de ambos os serviços.
5.  **Consulte a Documentação**: Consulte o Guia de Instalação e o README para obter mais informações.
6.  **Relate Problemas**: Se o problema persistir, envie um problema detalhado no [repositório GitHub duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionais {#additional-resources}

- **Guia de Instalação**: [Guia de Instalação](../installation/installation.md)
- **Documentação Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentação da API**: [Referência da API](../api-reference/overview.md)
- **Repositório GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guia de Desenvolvimento**: [Guia de Desenvolvimento](../development/setup.md)
- **Esquema de Banco de Dados**: [Documentação do Banco de Dados](../development/database)

### Suporte {#support}
- **GitHub Issues**: [Relatar bugs ou solicitar recursos](https://github.com/wsj-br/duplistatus/issues)

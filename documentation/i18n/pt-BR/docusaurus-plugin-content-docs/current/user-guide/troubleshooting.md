---
translation_last_updated: '2026-05-11T14:27:48.626Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: 561c33c1aa4c9a64d87a028ff06a261a2d66fc0342313d2513077cd2a35a957c
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/troubleshooting.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Solução de Problemas {#troubleshooting}

### Painel Não Carregando {#dashboard-not-loading}
- Verificar se o container está em execução: `docker ps`
- Verificar se a porta 9666 está acessível
- Verificar logs do container: `docker logs duplistatus`

### Sem Dados de Backup {#no-backup-data}
- Verificar a configuração do servidor Duplicati
- Verificar a conectividade de rede entre os servidores
- Revisar os logs do duplistatus em busca de erros
- Certifique-se de que os trabalhos de backup estão em execução

### Notificações Não Estão Funcionando {#notifications-not-working}
- Verificar a configuração das notificações
- Verificar a conectividade com o servidor NTFY (se estiver usando NTFY)
- Testar as configurações de notificação
- Verifique os logs das notificações

### Novos Backups Não Aparecem {#new-backups-not-showing}

Se você vir avisos do servidor Duplicati como `HTTP Response request failed for:` e `Failed to send message: System.Net.Http.HttpRequestException:`, e novos backups não aparecerem no Painel ou no Histórico de backups:

- **Verificar Configuração do Duplicati**: Confirmar que o Duplicati está configurado corretamente para enviar dados para **duplistatus**. Verificar as configurações de URL HTTP no Duplicati.
- **Verificar Conectividade de Rede**: Garantir que o servidor Duplicati possa se conectar ao servidor **duplistatus**. Confirmar que a porta está correta (padrão: `9666`).
- **Revisar Logs do Duplicati**: Verificar erros de requisição HTTP nos logs do Duplicati.

### Notificações Não Funcionando (Detalhado) {#notifications-not-working-detailed}

Se as notificações não estão sendo enviadas ou recebidas:

- **Verificar Configuração NTFY**: Certifique-se de que a URL NTFY e o tópico estão corretos. Use o botão **Enviar notificação de teste** para testar.
- **Verificar Conectividade de Rede**: Verifique se **duplistatus** consegue alcançar seu servidor NTFY. Revise as configurações de firewall, se aplicável.
- **Verificar Configurações de Notificação**: Confirme que as notificações estão habilitadas para os backups relevantes.

### Versões disponíveis não aparecem {#available-versions-not-appearing}

Se as versões de backup não forem exibidas no Painel ou na página de Detalhes:

- **Verificar Configuração do Duplicati**: Certifique-se de que `send-http-log-level=Information` e `send-http-max-log-lines=0` estão configurados nas opções avançadas do Duplicati.

### Alertas de Backup Atrasado Não Funcionando {#overdue-backup-alerts-not-working}

Se as notificações de backup atrasado não estão sendo enviadas:

- **Verificar Configuração de atrasos**: Confirme que o monitoramento de backup está habilitado para o backup. Verifique o intervalo esperado e as configurações de tolerância.
- **Verificar Frequência de notificações**: Se definida como **Uma vez**, os alertas são enviados apenas uma vez por evento atrasado.
- **Verificar Serviço Cron**: Certifique-se de que o serviço cron que monitora backups atrasados está funcionando corretamente. Verifique os logs da aplicação para erros. Verifique se o serviço cron está acessível na porta configurada (padrão: `8667`).

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

### Atualização de uma versão anterior (anterior à 0.9.x) e não é possível fazer login {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

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

**Se você estiver executando a versão 1.2.1 ou posterior:**
- Use a função integrada de backup do banco de dados em [Configurações → Manutenção do Banco de Dados](user-guide/settings/database-maintenance.md)
- Selecione o formato desejado (.db ou .sql) e clique em **Baixar Backup**
- O arquivo de backup será baixado para o seu computador
- Consulte [Manutenção do Banco de Dados](settings/database-maintenance.md#database-backup) para instruções detalhadas

**Se você está executando uma versão anterior à 1.2.1:**
- Você precisará fazer um backup manual. Consulte o [Guia de Migração](../migration/version_upgrade.md#backing-up-your-database-before-migration) para mais informações.

Se você ainda tiver problemas, tente as seguintes etapas:

1.  **Inspecionar Logs da Aplicação**: Se estiver usando Docker, execute `docker logs <container-name>` para revisar informações detalhadas de erro.
2.  **Validar Configuração**: Verifique novamente todas as configurações em sua ferramenta de gerenciamento de contêineres (Docker, Portainer, Podman, etc.), incluindo portas, rede e permissões.
3.  **Verificar Conectividade de Rede**: Confirme que todas as conexões de rede estão estáveis.
4.  **Verificar Serviço Cron**: Certifique-se de que o serviço cron está em execução junto com a aplicação principal. Verifique os logs de ambos os serviços.
5.  **Consultar Documentação**: Consulte o Guia de Instalação e o README para mais informações.
6.  **Relatar Problemas**: Se o problema persistir, envie um relato detalhado no [repositório duplistatus no GitHub](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionais {#additional-resources}

- **Guia de Instalação**: [Guia de Instalação](../installation/installation.md)
- **Documentação do Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentação da API**: [Referência da API](../api-reference/overview.md)
- **Repositório GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guia de Desenvolvimento**: [Guia de Desenvolvimento](../development/setup.md)
- **Esquema do Banco de Dados**: [Documentação do Banco de Dados](../development/database)

### Suporte {#support}
- **GitHub Issues**: [Relatar bugs ou solicitar recursos](https://github.com/wsj-br/duplistatus/issues)

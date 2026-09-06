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

- **Verificar Configuração do Duplicati**: Confirme que o Duplicati está configurado corretamente para enviar JSON para **duplistatus**. No Duplicati 2.0.9.106 e posteriores, use `--send-http-json-urls` apontando para `/api/upload`. No Duplicati mais antigo, use `--send-http-url` com `--send-http-result-output-format=Json`. Veja [Configuração do Servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Verificar Conectividade de Rede**: Certifique-se de que o servidor Duplicati pode se conectar ao servidor **duplistatus**. Confirme se a porta está correta (padrão: `9666`).
- **HTTP 401**: Chaves de API são necessárias e a URL de upload está faltando uma chave de escopo de upload válida. Adicione `?api_key=` conforme descrito em [Chaves de API](settings/api-keys-settings.md).
- **HTTP 403**: O escopo da chave está errado (uma chave de leitura não pode fazer upload), ou o host do Duplicati não está na [lista de permissões de IP da API externa](settings/ip-allowlist-settings.md).
- **HTTP 413**: O relatório JSON é maior que o limite de tamanho de upload (padrão 5 MB). Diminua `--send-http-max-log-lines` ou aumente o limite em Configurações → Chaves de API.
- **HTTP 429**: O limite de taxa de upload por IP foi excedido. Espere por `Retry-After`, ou aumente os limites se muitos trabalhos terminarem ao mesmo tempo.
- **Revisar Logs do Duplicati**: Verifique erros de solicitação HTTP nos logs do Duplicati.
- **Relatórios duplos**: Se você também enviar relatórios em formulário para [Monitoramento do Duplicati](https://www.duplicati-monitoring.com/), uma falha ou HTTP 500 desse serviço pode impedir o Duplicati de enviar o relatório JSON para **duplistatus**. URLs de formulário são enviadas primeiro. Veja [Relatórios para duplistatus e Monitoramento do Duplicati](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores Duplicados no Painel {#duplicate-servers-on-the-dashboard}

Se o mesmo servidor aparecer mais de uma vez no painel, isso geralmente acontece após [coletar logs de backup](collect-backup-logs.md) ou após reinstalar ou atualizar o servidor Duplicati.

**Causas:**

- **`machine_id` alterado**: Quando você reinstala ou atualiza o Duplicati, o `machine_id` do servidor pode mudar, e o **duplistatus** o trata como um novo servidor.
- **Bug da API do Duplicati**: Nas versões mais recentes do Duplicati, há um bug em que alguns endpoints da API misturam o id `identity` e o `machine_id`. Essa inconsistência faz com que o **duplistatus** registre o mesmo servidor com IDs diferentes, gerando duplicatas.

**Solução alternativa:**

1.  No **servidor Duplicati**, faça **um** dos seguintes:
    - Edite os arquivos `identity.txt` e `machineid.txt` para que ambos contenham o **mesmo** id; ou
    - Abra **Duplicati → Configurações → Opções Avançadas → Machine-id** e defina um valor (ele é preenchido automaticamente — basta aceitar o valor sugerido).
2.  **Reinicie** o servidor Duplicati para que a alteração entre em vigor.
3.  No **duplistatus**, consolide as entradas duplicadas usando [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificações Não Funcionando (Detalhado) {#notifications-not-working-detailed}

Se as notificações não estão sendo enviadas ou recebidas:

- **Verificar Configuração NTFY**: Certifique-se de que a URL NTFY e o tópico estão corretos. Use o botão **Enviar notificação de teste** para testar.
- **Verificar Conectividade de Rede**: Verifique se **duplistatus** consegue alcançar seu servidor NTFY. Revise as configurações de firewall, se aplicável.
- **Verificar Configurações de Notificação**: Confirme que as notificações estão habilitadas para os backups relevantes.

### Versões disponíveis não aparecem {#available-versions-not-appearing}

Se as versões de backup não forem exibidas no Painel ou na página de Detalhes:

- **Verificar Configuração do Duplicati**: Certifique-se de que `send-http-log-level=Information` e `send-http-max-log-lines=500` estão configurados nas opções avançadas do Duplicati. O Duplicati mantém as primeiras N linhas de log. Se a lista de versões ainda estiver ausente, aumente o limite ou use `0` quando não estiver enviando relatórios para o Monitoramento do Duplicati. A **contagem** de versões ainda pode aparecer nas estatísticas JSON quando a lista detalhada estiver ausente. Veja [Linhas de log e versões disponíveis](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

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

- No **Duplicati 2.4 e posteriores**, `/api/v1/systeminfo` lista `machine-id` com um padrão vazio. **duplistatus** lê o id configurado das configurações do servidor Duplicati. Se a coleção ainda não puder identificar o servidor, defina **Duplicati → Configurações → Opções Avançadas → Machine-id** e tente novamente.

### Atualização de uma versão anterior (anterior à 0.9.x) e não é possível fazer login {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** desde a versão 0.9.x requer autenticação de usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior:
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Você pode criar contas de usuários adicionais em [Configurações > Usuários](settings/user-management-settings.md) após o primeiro login.

### Senha de Admin Perdida ou Bloqueado {#lost-admin-password-or-locked-out}

Se você perdeu sua senha de administrador ou foi bloqueado da sua conta (você ainda pode abrir `/login`):

- **Use Admin Recovery Script**: Consulte o guia [Admin Account Recovery](admin-recovery.md) para obter instruções sobre como recuperar o acesso de administrador em ambientes Docker.
- **Verify Container Access**: Certifique-se de que você tem acesso Docker exec ao contêiner para executar o script de recuperação.

Se o navegador mostrar **Acesso negado** (HTTP 403) antes do login, isso é um [bloqueio de lista de permissões de IP](#locked-out-by-ip-allowlist), não uma senha esquecida. O script de recuperação de administrador não pode contorná-lo.

### Bloqueado pela Lista de Permissões de IP {#locked-out-by-ip-allowlist}

Se Configurações → [Lista de permissões de IP](settings/ip-allowlist-settings.md) estiver habilitado com um CIDR ausente ou incorreto, o proxy rejeita a solicitação antes da autenticação. Sintomas típicos:

- Páginas (`/`, `/login`, `/settings`, …) retornam **Acesso negado** em texto simples (HTTP 403).
- APIs de sessão e administrador retornam JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` e `/api/ping` ainda respondem (eles estão isentos). Cookies de login não ajudam.

O caminho de salvamento tenta evitar isso: você não pode habilitar a lista **admin** a menos que seu IP atual já esteja nos CIDRs (exceto ao salvar do loopback). Você ainda pode se bloquear usando um CIDR que corresponda agora mas não mais tarde (VPN, DHCP, outra rede), configurando incorretamente os proxies confiáveis ou habilitando a lista de `127.0.0.1` / `::1` sem adicionar esse endereço.

Variáveis de ambiente sobrescrevem o banco de dados, então você pode recuperar sem a interface do usuário. Elas não reescrevem Configurações; uma reinicialização é necessária para que o processo as pegue.

**Desative a lista de administradores** (recuperação usual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou mantenha-a habilitada e injete um CIDR que inclua seu IP atual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Em seguida, reinicie a aplicação:

- **Docker Compose**: defina as mesmas chaves em `environment` em `docker-compose.yml` (o arquivo inclui exemplos comentados) e recrie o contêiner do aplicativo. `docker exec` não altera as variáveis de ambiente de um contêiner em execução.
- **Local / systemd**: exporte a variável no ambiente do serviço e reinicie o processo Next.js (não apenas o serviço cron).

Depois que você puder abrir a interface do usuário novamente:

1. Faça login e corrija os CIDRs e proxies confiáveis em Configurações → Lista de permissões de IP.
2. Remova a substituição de ambiente para que as Configurações sejam a fonte de verdade novamente.

A lista de permissões de **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) não bloqueia o painel. Recupere-a da mesma forma com `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Se os uploads do Duplicati falharem com HTTP 403 após você habilitar essa lista, veja [Novos Backups Não Mostrando](#new-backups-not-showing). A recuperação de proxies confiáveis usa `IP_TRUSTED_PROXIES` (um valor não vazio também implica trust-proxy).

Veja [Lista de permissões de IP](settings/ip-allowlist-settings.md#environment-overrides) e [Variáveis de Ambiente](../installation/environment-variables.md).

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

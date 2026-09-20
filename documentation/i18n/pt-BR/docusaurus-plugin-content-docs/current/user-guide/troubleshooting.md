# Solução de Problemas {/* #troubleshooting */}

### Painel Não Carregando {/* #dashboard-not-loading */}
- Verifique se o contêiner está em execução: `docker ps`
- Verifique se a porta 9666 está acessível
- Verifique os logs do contêiner: `docker logs duplistatus`
- Se você estiver usando um proxy reverso, verifique os logs do proxy reverso para identificar erros
- Se você estiver usando listas de permissões de IP, verifique os logs da lista de permissões de IP para identificar erros

### Nenhum Dado de Backup {/* #no-backup-data */}
- Verifique a configuração do servidor Duplicati
- Verifique a conectividade de rede entre servidores
- Revise os logs do duplistatus para identificar erros
- Garanta que os trabalhos de backup estejam em execução
- Se estiver usando chaves de API, garanta que a chave de API esteja correta, que o escopo esteja correto e não expirado (uma chave de leitura não pode carregar)

### Notificações Não Funcionando {/* #notifications-not-working */}
- Verifique a configuração das notificações
- Verifique a conectividade com o servidor NTFY (se estiver usando NTFY)
- Teste as configurações de notificação
- Verifique os logs de notificação

### Novos Backups Não Aparecendo {/* #new-backups-not-showing */}

Se você vir avisos do servidor Duplicati como `HTTP Response request failed for:` e `Failed to send message: System.Net.Http.HttpRequestException:`, e novos backups não aparecerem no painel ou no histórico de backup:

- **Verifique a Configuração do Duplicati**: Confirme que o Duplicati está configurado corretamente para enviar JSON para **duplistatus**. No Duplicati 2.0.9.106 e posteriores, use `--send-http-json-urls` apontando para `/api/upload`. Em versões mais antigas do Duplicati, use `--send-http-url` com `--send-http-result-output-format=Json`. Veja [Configuração do Servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Verifique a Conectividade de Rede**: Garanta que o servidor Duplicati possa se conectar ao servidor **duplistatus**. Confirme que a porta está correta (padrão: `9666`).
- **HTTP 401**: Chaves de API são obrigatórias e a URL de upload está faltando uma chave válida com escopo de upload. Adicione `?api_key=` conforme descrito em [Chaves de API](settings/api-keys-settings.md).
- **HTTP 403**: O escopo da chave está incorreto (uma chave de leitura não pode carregar), ou o host Duplicati não está na [lista de permissões de IP da API externa](settings/ip-allowlist-settings.md).
- **HTTP 413**: O relatório JSON é maior que o limite de tamanho de upload (padrão 5 MB). Reduza `--send-http-max-log-lines` ou aumente o limite em Configurações → Chaves de API.
- **HTTP 429**: O limite de taxa de upload por IP foi excedido. Aguarde `Retry-After`, ou aumente os limites se muitos trabalhos terminarem ao mesmo tempo.
- **Revise os Logs do Duplicati**: Verifique se há erros de solicitação HTTP nos logs do Duplicati.
- **Relatórios duplos**: Se você também enviar relatórios de formulário para [Monitoramento Duplicati](https://www.duplicati-monitoring.com/), uma falha ou HTTP 500 desse serviço pode impedir o Duplicati de enviar o relatório JSON para **duplistatus**. URLs de formulário são enviadas primeiro. Veja [Relatórios para duplistatus e Monitoramento Duplicati](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores Duplicados no Painel {/* #duplicate-servers-on-the-dashboard */}

Se o mesmo servidor aparecer mais de uma vez no painel, isso geralmente acontece após [coletar logs de backup](collect-backup-logs.md), ou após reinstalar ou atualizar o servidor Duplicati.

**Causas:**

- **`machine_id` Alterado**: Quando você reinstala ou atualiza o Duplicati, o `machine_id` do servidor pode mudar, e então o **duplistatus** passa a tratá-lo como um novo servidor.
- **Bug na API do Duplicati**: Em versões mais recentes do Duplicati há um bug onde alguns endpoints da API misturam o id `identity` e o `machine_id`. Essa inconsistência faz com que o **duplistatus** registre o mesmo servidor sob IDs diferentes, gerando duplicatas.

**Correção:**

1.  No **servidor Duplicati**, faça **uma** das seguintes opções:
    - Edite os arquivos `identity.txt` e `machineid.txt` para que ambos contenham o **mesmo** id; ou
    - Abra **Duplicati → Configurações → Opções Avançadas → Machine-id** e defina um valor (é preenchido automaticamente — apenas aceite o valor sugerido).
2.  **Reinicie** o servidor Duplicati para que a alteração tenha efeito.
3.  No **duplistatus**, consolide as entradas duplicadas usando [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificações Não Funcionando (Detalhado) {/* #notifications-not-working-detailed */}

Se as notificações não estiverem sendo enviadas ou recebidas:

- **Verifique a Configuração do NTFY**: Garanta que a URL e o tópico do NTFY estejam corretos. Use o botão **Enviar Notificação de Teste** para testar.
- **Verifique a Conectividade de Rede**: Verifique se o **duplistatus** consegue alcançar seu servidor NTFY. Revise as configurações de firewall, se aplicável.
- **Verifique as Configurações de Notificação**: Confirme que as notificações estão habilitadas para os backups relevantes.

### Versões Disponíveis Não Aparecendo {/* #available-versions-not-appearing */}

Se as versões de backup não forem mostradas no painel ou na página de detalhes:

- **Verificar Configuração do Duplicati**: Certifique-se de que `send-http-log-level=Information` e `send-http-max-log-lines=500` estejam configurados nas opções avançadas do Duplicati. O Duplicati mantém as primeiras N linhas de log. Se a lista de versões ainda estiver ausente, aumente o limite ou use `0` quando você não estiver enviando relatórios também para o Monitoramento do Duplicati. A **contagem** de versões ainda pode aparecer nas estatísticas JSON quando a lista detalhada estiver ausente. Veja [Linhas de log e versões disponíveis](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertas de Backup Atrasado Não Funcionando {/* #overdue-backup-alerts-not-working */}

Se as notificações de backup atrasado não estiverem sendo enviadas:

- **Verificar Configuração de Atraso**: Confirme se o monitoramento de backup está habilitado para o backup. Verifique o intervalo esperado e as configurações de tolerância.
- **Verificar Frequência de Notificação**: Se definido como **Uma vez**, os alertas são enviados apenas uma vez por evento de atraso.
- **Verificar Serviço Cron**: Certifique-se de que o serviço cron que monitora backups atrasados esteja funcionando corretamente. Verifique os logs do aplicativo em busca de erros. Verifique se o serviço cron é acessível na porta configurada (padrão: `8667`).

### Coleta de Logs de Backup Não Funcionando {/* #collect-backup-logs-not-working */}

Se a coleta manual de logs de backup falhar:

- **Verificar Acesso ao Servidor Duplicati**: Verifique se o nome do host e a porta do servidor Duplicati estão corretos. Confirme que o acesso remoto está habilitado no Duplicati. Certifique-se de que a senha de autenticação esteja correta.
- **Verificar Conectividade de Rede**: Teste a conectividade de **duplistatus** para o servidor Duplicati. Confirme que a porta do servidor Duplicati seja acessível (padrão: `8200`).
  Por exemplo, se você estiver usando Docker, poderá usar `docker exec -it <container-name> /bin/sh` para acessar a linha de comando do contêiner e executar ferramentas de rede como `ping` e `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Também verifique a configuração de DNS dentro do contêiner (veja mais em [Configuração de DNS para Contêineres Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- No **Duplicati 2.4 e posterior**, `/api/v1/systeminfo` lista `machine-id` com um padrão vazio. **duplistatus** lê o id configurado nas configurações do servidor Duplicati. Se a coleta ainda não conseguir identificar o servidor, defina **Duplicati → Configurações → Opções Avançadas → Machine-id** e tente novamente.

### Atualizar de uma versão anterior (antes da 0.9.x) e não consigo fazer login {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** a partir da versão 0.9.x requer autenticação de usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior: 
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Você pode criar contas adicionais de usuários em [Configurações > Usuários](settings/user-management-settings.md) após o primeiro login.

### Senha de Administrador Perdida ou Bloqueado {/* #lost-admin-password-or-locked-out */}

Se você perdeu sua senha de administrador ou foi bloqueado da sua conta (você ainda pode abrir `/login`):

- **Usar Script de Recuperação de Administrador**: Veja o guia [Recuperação de Conta de Administrador](admin-recovery.md) para instruções sobre como recuperar o acesso de administrador em ambientes Docker.
- **Verificar Acesso ao Contêiner**: Certifique-se de ter acesso Docker exec ao contêiner para executar o script de recuperação.

Se o navegador mostrar **Acesso negado** (HTTP 403) antes do login, isso é um [bloqueio de lista de permissões de IP](#locked-out-by-ip-allowlist), não uma senha esquecida. O script de recuperação de administrador não pode contorná-lo.

### Bloqueado pela Lista de Permissões de IP {/* #locked-out-by-ip-allowlist */}

Se Configurações → [Lista de Permissões de IP](settings/ip-allowlist-settings.md) estiver habilitada com um CIDR ausente ou incorreto, o proxy rejeita a solicitação antes da autenticação. Sintomas típicos:

- Páginas (`/`, `/login`, `/settings`, …) retornam texto simples **Acesso negado** (HTTP 403).
- APIs de sessão e administrativas retornam JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` e `/api/ping` também retornam 403 de um IP não listado quando qualquer uma das listas de permissão estiver habilitada. Eles ainda respondem do loopback. Cookies de login não ajudam.

Para confirmar que o aplicativo está ativo durante um bloqueio, execute a verificação dentro do contêiner (loopback sempre é permitido):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

O caminho de salvamento tenta evitar isso: você não pode ativar a lista de **administrador** a menos que seu IP atual já esteja nos CIDRs (exceto ao salvar via loopback). Você ainda pode se bloquear usando um CIDR que corresponda agora, mas não mais tarde (VPN, DHCP, outra rede), configurando incorretamente proxies confiáveis ou ativando a lista de `127.0.0.1` / `::1` sem adicionar esse endereço.

Variáveis de ambiente substituem o banco de dados, então você pode recuperar sem a interface. Elas não reescrevem Configurações; é necessário reiniciar para que o processo as reconheça.

**Desative a lista de administrador** (recuperação usual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou mantenha-a ativada e injete um CIDR que inclua seu IP atual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Então reinicie o aplicativo:

- **Docker Compose**: defina as mesmas chaves sob `environment` em `docker-compose.yml` (o arquivo inclui exemplos comentados) e recrie o contêiner do aplicativo. `docker exec` não altera variáveis de ambiente de um contêiner em execução.
- **Local / systemd**: exporte a variável no ambiente do serviço e reinicie o processo Next.js (não apenas o serviço cron).

Depois que puder abrir a interface novamente:

1. Faça login e corrija os CIDRs e proxies confiáveis em Configurações → Lista de permissões de IP.
2. Remova a substituição por variável de ambiente para que Configurações volte a ser a fonte da verdade.

A lista de permissões da **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) não bloqueia o painel. Recupere-o da mesma forma com `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Se uploads do Duplicati falharem com HTTP 403 após ativar essa lista, consulte [Novos Backups Não Aparecendo](#new-backups-not-showing). A recuperação por proxy confiável usa `IP_TRUSTED_PROXIES` (um valor não vazio também implica confiança no proxy).

Consulte [Lista de permissões de IP](settings/ip-allowlist-settings.md#environment-overrides) e [Variáveis de Ambiente](../installation/environment-variables.md).

### Backup e Migração do Banco de Dados {/* #database-backup-and-migration */}

Ao migrar de versões anteriores ou criar um backup do banco de dados:

**Se estiver executando a versão 1.2.1 ou posterior:**
- Use a função integrada de backup do banco de dados em [Configurações → Manutenção do Banco de Dados](user-guide/settings/database-maintenance.md)
- Selecione seu formato preferido (.db ou .sql) e clique em **Baixar Backup**
- O arquivo de backup será baixado para seu computador
- Consulte [Manutenção do Banco de Dados](settings/database-maintenance.md#database-backup) para instruções detalhadas

**Se estiver executando uma versão anterior à 1.2.1:**
- Você precisará fazer backup manualmente. Consulte o [Guia de Migração](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obter mais informações.

Se ainda tiver problemas, tente estas etapas:

1.  **Inspecione os Logs do Aplicativo**: Se estiver usando Docker, execute `docker logs <container-name>` para revisar informações detalhadas de erro.
2.  **Valide a Configuração**: Verifique novamente todas as configurações no seu gerenciador de contêiner (Docker, Portainer, Podman, etc.), incluindo portas, rede e permissões.
3.  **Verifique a Conectividade de Rede**: Confirme que todas as conexões de rede estão estáveis. 
4.  **Verifique o Serviço Cron**: Certifique-se de que o serviço cron esteja em execução junto com o aplicativo principal. Verifique os logs de ambos os serviços.
5.  **Consulte a Documentação**: Consulte o Guia de Instalação e o README para obter mais informações.
6.  **Relate Problemas**: Se o problema persistir, envie um relato detalhado no [repositório GitHub do duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionais {/* #additional-resources */}

- **Guia de Instalação**: [Guia de Instalação](../installation/installation.md)
- **Documentação do Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentação da API**: [Referência da API](../api-reference/overview.md)
- **Repositório no GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guia de Desenvolvimento**: [Guia de Desenvolvimento](../development/setup.md)
- **Esquema do Banco de Dados**: [Documentação do Banco de Dados](../development/database)

### Suporte {/* #support */}
- **GitHub Issues**: [Relatar bugs ou solicitar recursos](https://github.com/wsj-br/duplistatus/issues)

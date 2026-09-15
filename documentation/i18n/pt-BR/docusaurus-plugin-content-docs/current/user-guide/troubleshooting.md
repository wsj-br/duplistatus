# Solução de Problemas {/* #troubleshooting */}

### Painel Não Carregando {/* #dashboard-not-loading */}
- Verifique se o container está em execução: `docker ps`
- Verifique se a porta 9666 está acessível
- Verifique os logs do container: `docker logs duplistatus`
- Se você estiver usando um proxy reverso, verifique os logs do proxy reverso para erros
- Se você estiver usando listas de permissões de IP, verifique os logs da lista de permissões de IP para erros

### Sem Dados de Backup {/* #no-backup-data */}
- Verifique a configuração do servidor Duplicati
- Verifique a conectividade de rede entre os servidores
- Revise os logs duplistatus para erros
- Certifique-se de que os trabalhos de backup estão em execução
- Se estiver usando chaves de API, certifique-se de que a chave de API está correta, o escopo está correto e não está expirado (uma chave de leitura não pode carregar)

### Notificações Não Funcionando {/* #notifications-not-working */}
- Verifique a configuração de notificações
- Verifique a conectividade do servidor NTFY (se estiver usando NTFY)
- Teste as configurações de notificação
- Verifique os logs de notificação

### Novos Backups Não Aparecendo {/* #new-backups-not-showing */}

Se você vê avisos do servidor Duplicati como `HTTP Response request failed for:` e `Failed to send message: System.Net.Http.HttpRequestException:`, e novos backups não aparecem no painel ou no histórico de backup:

- **Verifique a Configuração do Duplicati**: Confirme que o Duplicati está configurado corretamente para enviar JSON para **duplistatus**. No Duplicati 2.0.9.106 e posterior, use `--send-http-json-urls` apontando para `/api/upload`. No Duplicati mais antigo, use `--send-http-url` com `--send-http-result-output-format=Json`. Veja [Configuração do Servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Verifique a Conectividade de Rede**: Certifique-se de que o servidor Duplicati pode se conectar ao servidor **duplistatus**. Confirme se a porta está correta (padrão: `9666`).
- **HTTP 401**: Chaves de API são necessárias e a URL de upload está faltando uma chave de escopo de upload válida. Adicione `?api_key=` conforme descrito em [Chaves de API](settings/api-keys-settings.md).
- **HTTP 403**: O escopo da chave está errado (uma chave de leitura não pode carregar), ou o host do Duplicati não está na [lista de permissões de IP da API externa](settings/ip-allowlist-settings.md).
- **HTTP 413**: O relatório JSON é maior que o limite de tamanho de upload (padrão 5 MB). Reduza `--send-http-max-log-lines` ou aumente o limite em Configurações → Chaves de API.
- **HTTP 429**: O limite de taxa de upload por IP foi excedido. Espere por `Retry-After`, ou aumente os limites se muitos trabalhos terminarem ao mesmo tempo.
- **Revise os Logs do Duplicati**: Verifique erros de solicitação HTTP nos logs do Duplicati.
- **Relatório Duplo**: Se você também enviar relatórios de formulário para [Monitoramento do Duplicati](https://www.duplicati-monitoring.com/), uma falha ou HTTP 500 desse serviço pode impedir que o Duplicati envie o relatório JSON para **duplistatus**. As URLs de formulário são enviadas primeiro. Veja [Relatórios para duplistatus e Monitoramento do Duplicati](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores Duplicados no Painel {/* #duplicate-servers-on-the-dashboard */}

Se o mesmo servidor aparecer mais de uma vez no painel, isso acontece com mais frequência após [coletar logs de backup](collect-backup-logs.md), ou após reinstalar ou atualizar o servidor Duplicati.

**Causas:**

- **`machine_id` Alterado**: Quando você reinstala ou atualiza o Duplicati, o `machine_id` do servidor pode mudar, e o **duplistatus** o trata como um novo servidor.
- **Bug na API do Duplicati**: Em versões mais recentes do Duplicati, há um bug em que alguns endpoints da API misturam o id `identity` e o `machine_id`. Essa inconsistência faz com que o **duplistatus** registre o mesmo servidor sob diferentes IDs, gerando duplicatas.

**Solução:**

1.  No **servidor Duplicati**, faça **um** dos seguintes:
    - Edite os arquivos `identity.txt` e `machineid.txt` para que ambos os arquivos contenham o **mesmo** id; ou
    - Abra **Duplicati → Configurações → Opções Avançadas → Machine-id** e defina um valor (é preenchido automaticamente — apenas aceite o valor sugerido).
2.  **Reinicie** o servidor Duplicati para que a alteração tenha efeito.
3.  No **duplistatus**, consolide as entradas duplicadas usando [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificações Não Funcionando (Detalhado) {/* #notifications-not-working-detailed */}

Se as notificações não estão sendo enviadas ou recebidas:

- **Verifique a Configuração do NTFY**: Certifique-se de que a URL do NTFY e o tópico estão corretos. Use o botão **Enviar Notificação de Teste** para testar.
- **Verifique a Conectividade de Rede**: Verifique se o **duplistatus** pode alcançar seu servidor NTFY. Revise as configurações do firewall, se aplicável.
- **Verifique as Configurações de Notificação**: Confirme que as notificações estão habilitadas para os backups relevantes.

### Versões Disponíveis Não Aparecem {/* #available-versions-not-appearing */}

Se as versões de backup não estiverem sendo exibidas no painel ou na página de detalhes:

- **Verificar Configuração do Duplicati**: Certifique-se de que `send-http-log-level=Information` e `send-http-max-log-lines=500` estão configurados nas opções avançadas do Duplicati. O Duplicati mantém as primeiras N linhas de log. Se a lista de versões ainda estiver ausente, aumente o limite ou use `0` quando você não estiver enviando relatórios para o Monitoramento do Duplicati. A **contagem** de versões ainda pode aparecer a partir das estatísticas JSON quando a lista detalhada estiver ausente. Veja [Linhas de log e versões disponíveis](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertas de Backup Atrasado Não Funcionam {/* #overdue-backup-alerts-not-working */}

Se as notificações de backup atrasado não estiverem sendo enviadas:

- **Verificar Configuração de Atraso**: Confirme que o monitoramento de backup está habilitado para o backup. Verifique as configurações de intervalo esperado e tolerância.
- **Verificar Frequência de Notificação**: Se definido como **Uma vez**, os alertas são enviados apenas uma vez por evento de atraso.
- **Verificar Serviço Cron**: Certifique-se de que o serviço cron que monitora backups atrasados está sendo executado corretamente. Verifique os logs do aplicativo para erros. Confirme que o serviço cron está acessível na porta configurada (padrão: `8667`).

### Coletar Logs de Backup Não Funciona {/* #collect-backup-logs-not-working */}

Se a coleta manual de logs de backup falhar:

- **Verificar Acesso ao Servidor Duplicati**: Verifique se o nome do host e a porta do servidor Duplicati estão corretos. Confirme que o acesso remoto está habilitado no Duplicati. Certifique-se de que a senha de autenticação está correta.
- **Verificar Conectividade de Rede**: Teste a conectividade de **duplistatus** para o servidor Duplicati. Confirme que a porta do servidor Duplicati está acessível (padrão: `8200`).
  Por exemplo, se você estiver usando Docker, você pode usar `docker exec -it <container-name> /bin/sh` para acessar a linha de comando do contêiner e executar ferramentas de rede como `ping` e `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Verifique também a configuração de DNS dentro do contêiner (veja mais em [Configuração de DNS para Contêineres Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- No **Duplicati 2.4 e posterior**, `/api/v1/systeminfo` lista `machine-id` com um padrão vazio. **duplistatus** lê o ID configurado das configurações do servidor Duplicati. Se a coleta ainda não puder identificar o servidor, defina **Duplicati → Configurações → Opções Avançadas → Machine-id** e tente novamente.

### Atualização de uma versão anterior (antes da 0.9.x) e não consegue fazer login {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

O **duplistatus** desde a versão 0.9.x requer autenticação de usuário. Uma conta padrão `admin` é criada automaticamente quando o aplicativo é instalado pela primeira vez ou atualizado de uma versão anterior: 
    - nome de usuário: `admin`
    - senha: `Duplistatus09`

Você pode criar contas de usuários adicionais em [Configurações > Usuários](settings/user-management-settings.md) após o primeiro login.

### Senha de Administrador Perdida ou Bloqueado {/* #lost-admin-password-or-locked-out */}

Se você perdeu sua senha de administrador ou foi bloqueado da sua conta (você ainda pode abrir `/login`):

- **Usar Script de Recuperação de Administrador**: Veja o guia [Recuperação de Conta de Administrador](admin-recovery.md) para instruções sobre como recuperar o acesso de administrador em ambientes Docker.
- **Verificar Acesso ao Contêiner**: Certifique-se de ter acesso Docker exec ao contêiner para executar o script de recuperação.

Se o navegador mostrar **Acesso negado** (HTTP 403) antes do login, isso é um [bloqueio de lista de permissões de IP](#locked-out-by-ip-allowlist), não uma senha esquecida. O script de recuperação de administrador não pode contorná-lo.

### Bloqueado por Lista de Permissões de IP {/* #locked-out-by-ip-allowlist */}

Se Configurações → [Lista de permissões de IP](settings/ip-allowlist-settings.md) estiver habilitada com um CIDR ausente ou incorreto, o proxy rejeita a solicitação antes da autenticação. Sintomas típicos:

- Páginas (`/`, `/login`, `/settings`, …) retornam **Acesso negado** em texto simples (HTTP 403).
- APIs de sessão e administrador retornam JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` e `/api/ping` também retornam 403 de um IP não listado quando qualquer lista de permissões estiver habilitada. Eles ainda respondem do loopback. Os cookies de login não ajudam.

Para confirmar que o aplicativo está em execução durante um bloqueio, execute a sondagem dentro do contêiner (o loopback sempre é permitido):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

O caminho de salvamento tenta evitar isso: você não pode ativar a lista de **administradores** a menos que seu IP atual já esteja na lista de CIDRs (exceto ao salvar do loopback). Você ainda pode se bloquear usando um CIDR que corresponda agora, mas não mais tarde (VPN, DHCP, outra rede), configurando incorretamente os proxies confiáveis ou ativando a lista de `127.0.0.1` / `::1` sem adicionar esse endereço.

As variáveis de ambiente substituem o banco de dados, então você pode recuperar sem a interface do usuário. Elas não reescrevem as Configurações; é necessário reiniciar para que o processo as pegue.

**Desative a lista de administradores** (recuperação usual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou mantenha-a ativada e injete um CIDR que inclua seu IP atual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Em seguida, reinicie o aplicativo:

- **Docker Compose**: defina as mesmas chaves em `environment` dentro de `docker-compose.yml` (o arquivo inclui exemplos comentados) e recrie o contêiner do aplicativo. `docker exec` não altera as variáveis de ambiente de um contêiner em execução.
- **Local / systemd**: exporte a variável no ambiente do serviço e reinicie o processo do Next.js (não apenas o serviço cron).

Depois que você puder abrir a interface do usuário novamente:

1. Faça login e corrija os CIDRs e os proxies confiáveis em Configurações → Lista de permissões de IP.
2. Remova a substituição de ambiente para que as Configurações sejam a fonte de verdade novamente.

A lista de permissões da **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) não bloqueia o painel. Recupere da mesma forma com `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Se os uploads do Duplicati falharem com HTTP 403 após ativar essa lista, consulte [Novos Backups Não Mostrando](#new-backups-not-showing). A recuperação de proxies confiáveis usa `IP_TRUSTED_PROXIES` (um valor não vazio também implica trust-proxy).

Consulte [Lista de permissões de IP](settings/ip-allowlist-settings.md#environment-overrides) e [Variáveis de Ambiente](../installation/environment-variables.md).

### Backup e Migração do Banco de Dados {/* #database-backup-and-migration */}

Ao migrar de versões anteriores ou criar um backup do banco de dados:

**Se você está executando a versão 1.2.1 ou posterior:**
- Use a função de backup do banco de dados embutida em [Configurações → Manutenção do Banco de Dados](user-guide/settings/database-maintenance.md)
- Selecione o formato preferido (.db ou .sql) e clique em **Baixar Backup**
- O arquivo de backup será baixado para o seu computador
- Consulte [Manutenção do Banco de Dados](settings/database-maintenance.md#database-backup) para instruções detalhadas

**Se você está executando uma versão anterior à 1.2.1:**
- Você precisará fazer o backup manualmente. consulte o [Guia de Migração](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obter mais informações.

Se você ainda estiver com problemas, tente os seguintes passos:

1. **Inspecionar Logs do Aplicativo**: Se estiver usando Docker, execute `docker logs <container-name>` para revisar informações detalhadas de erro.
2. **Validar Configuração**: Verifique novamente todas as configurações de configuração em sua ferramenta de gerenciamento de contêineres (Docker, Portainer, Podman, etc.), incluindo portas, rede e permissões.
3. **Verificar Conectividade de Rede**: Confirme que todas as conexões de rede estão estáveis.
4. **Verificar Serviço Cron**: Certifique-se de que o serviço cron está em execução ao lado do aplicativo principal. Verifique os logs de ambos os serviços.
5. **Consultar Documentação**: Consulte o Guia de Instalação e o README para obter mais informações.
6. **Reportar Problemas**: Se o problema persistir, envie um problema detalhado no repositório [duplistatus GitHub](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionais {/* #additional-resources */}

- **Guia de Instalação**: [Guia de Instalação](../installation/installation.md)
- **Documentação do Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentação da API**: [Referência da API](../api-reference/overview.md)
- **Repositório GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guia de Desenvolvimento**: [Guia de Desenvolvimento](../development/setup.md)
- **Esquema do Banco de Dados**: [Documentação do Banco de Dados](../development/database)

### Suporte {/* #support */}
- **Problemas no GitHub**: [Relatar bugs ou solicitar recursos](https://github.com/wsj-br/duplistatus/issues)

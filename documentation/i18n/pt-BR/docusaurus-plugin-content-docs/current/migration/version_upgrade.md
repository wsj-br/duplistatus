# Guia de Migração {/* #migration-guide */}

Este guia explica como atualizar entre versões do duplistatus. As migrações são automáticas—o esquema do banco de dados se atualiza automaticamente quando você inicia uma nova versão.

Etapas manuais são necessárias apenas se você personalizou modelos de notificação (a versão 0.8.x alterou variáveis de modelo) ou integrações de API externas que precisam ser atualizadas (a versão 0.7.x alterou nomes de campos de API, a versão 0.9.x requer autenticação).

## Visão geral {/* #overview */}

duplistatus migra automaticamente o esquema do seu banco de dados ao atualizar. O sistema:

1. Cria um backup do seu banco de dados antes de fazer alterações
2. Atualiza o esquema do banco de dados para a versão mais recente
3. Preserva todos os dados existentes (servidores, backups, configuração)
4. Verifica se a migração foi concluída com sucesso

## Fazendo Backup do Seu Banco de Dados Antes da Migração {/* #backing-up-your-database-before-migration */}

Antes de atualizar para uma nova versão, é recomendado criar um backup do seu banco de dados. Isso garante que você possa restaurar seus dados se algo der errado durante o processo de migração.

### Se Você Estiver Executando a Versão 1.2.1 ou Posterior {/* #if-youre-running-version-121-or-later */}

Use a função de backup de banco de dados integrada:

1. Navegue até [Configurações → Manutenção do Banco de Dados](../user-guide/settings/database-maintenance.md) na interface web
2. Na seção **Backup do Banco de Dados**, selecione um formato de backup:
   - **Arquivo de Banco de Dados (.db)**: Formato binário - backup mais rápido, preserva toda a estrutura do banco de dados exatamente
   - **Despejo SQL (.sql)**: Formato de texto - instruções SQL legíveis por humanos
3. Clique em **Baixar Backup**
4. O arquivo de backup será baixado para seu computador com um nome de arquivo com timestamp

Para mais detalhes, consulte a documentação de [Manutenção do Banco de Dados](../user-guide/settings/database-maintenance.md#database-backup).

### Se Você Estiver Executando uma Versão Anterior a 1.2.1 {/* #if-youre-running-a-version-before-121 */}

#### Backup {/* #backup */}

Você deve fazer backup manual do banco de dados antes de prosseguir. O arquivo do banco de dados está localizado em `/app/data/backups.db` dentro do contêiner.

##### Para Usuários do Linux {/* #for-linux-users */}
Se você está no Linux, não se preocupe em iniciar contêineres auxiliares. Você pode usar o comando nativo `cp` para extrair o banco de dados diretamente do contêiner em execução para seu host.

###### Usando Docker ou Podman: {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Se estiver usando Podman, simplesmente substitua `docker` por `podman` no comando acima.)

##### Para Usuários do Windows {/* #for-windows-users */}
Se você está executando o Docker Desktop no Windows, você tem duas maneiras simples de lidar com isso sem usar a linha de comando:

###### Opção A: Use o Docker Desktop (Mais Fácil) {/* #option-a-use-docker-desktop-easiest */}
1. Abra o Painel do Docker Desktop.
2. Vá para a aba Contêineres e clique no seu contêiner duplistatus.
3. Clique na aba Arquivos.
4. Navegue até `/app/data/`.
5. Clique com o botão direito em `backups.db` e selecione **Salvar como...** para baixá-lo para suas pastas do Windows.

###### Opção B: Use PowerShell {/* #option-b-use-powershell */}
Se preferir o terminal, você pode usar PowerShell para copiar o arquivo para sua Área de Trabalho:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Se Você Usar Bind Mounts {/* #if-you-use-bind-mounts */}
Se você configurou originalmente seu contêiner usando um bind mount (por exemplo, você mapeou uma pasta local como `/opt/duplistatus` para o contêiner), você não precisa de comandos Docker. Apenas copie o arquivo usando seu gerenciador de arquivos:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplesmente copie o arquivo no **Explorador de Arquivos** da pasta que você designou durante a configuração.

#### Restaurando Seus Dados {/* #restoring-your-data */}
Se você precisar restaurar seu banco de dados a partir de um backup anterior, siga as etapas abaixo com base no seu sistema operacional.

:::info[IMPORTANTE] 
Parada o contêiner antes de restaurar o banco de dados para evitar corrupção de arquivos.
:::

##### Para Usuários Linux {/* #for-linux-users-1 */}
A maneira mais fácil de restaurar é "enviar" o arquivo de backup de volta para o caminho de armazenamento interno do contêiner.

###### Usando Docker ou Podman: {/* #using-docker-or-podman-1 */}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Para Usuários Windows {/* #for-windows-users-1 */}
Se você estiver usando Docker Desktop, você pode executar a restauração via GUI ou PowerShell.

###### Opção A: Use Docker Desktop (GUI) {/* #option-a-use-docker-desktop-gui */}
1. Certifique-se de que o contêiner duplistatus está Em Execução (Docker Desktop requer que o contêiner esteja ativo para carregar arquivos via GUI).
2. Vá para a aba Arquivos nas configurações do seu contêiner.
3. Navegue até `/app/data/`.
4. Clique com o botão direito no backups.db existente e selecione Excluir.
5. Clique no botão Importar (ou clique com o botão direito na área da pasta) e selecione seu arquivo de backup do seu computador.

Renomeie o arquivo importado para exatamente backups.db se ele tiver um timestamp no nome.

Reinicie o contêiner.

###### Opção B: Use PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Se Você Usar Bind Mounts {/* #if-you-use-bind-mounts-1 */}
Se você estiver usando uma pasta local mapeada para o contêiner, você não precisa de nenhum comando especial.

1. Parada o contêiner.
2. Copie manualmente seu arquivo de backup para sua pasta mapeada (por exemplo, `/opt/duplistatus` ou `C:\duplistatus_data`).
3. Certifique-se de que o arquivo é nomeado exatamente `backups.db`.
4. Inicie o contêiner.

:::note
Se você restaurar o banco de dados manualmente, você pode encontrar erros de permissão. 

Verifique os logs do contêiner e ajuste as permissões se necessário. Consulte a seção [Solução de Problemas](#troubleshooting-your-restore--rollback) abaixo para mais informações.
:::

## Processo de Migração Automática {/* #automatic-migration-process */}

Quando você inicia uma nova versão, as migrações são executadas automaticamente:

1. **Criação de Backup**: Um backup com timestamp é criado em seu diretório de dados
2. **Atualização de Schema**: Tabelas e campos do banco de dados são atualizados conforme necessário
3. **Migração de Dados**: Todos os dados existentes são preservados e migrados
4. **Verificação**: O sucesso da migração é registrado

### Monitorando Migração {/* #monitoring-migration */}

Verifique os logs do Docker para monitorar o progresso da migração:

```bash
docker logs <container-name>
```

Procure por mensagens como:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de Migração Específicas da Versão {/* #version-specific-migration-notes */}

### Atualizando para a Versão 0.9.x ou Posterior (Schema v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**Autenticação agora é obrigatória.** Todos os usuários devem entrar após a atualização.
:::

#### O Que Muda Automaticamente {/* #what-changes-automatically */}

- Schema do banco de dados migra de v3.1 para v4.0
- Novas tabelas criadas: `users`, `sessions`, `audit_log`
- Conta de administrador padrão criada automaticamente
- Todas as sessões existentes invalidadas

#### O Que Você Deve Fazer {/* #what-you-must-do */}

1. **Entre** com as credenciais padrão do administrador:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09`
2. **Altere a senha** quando solicitado (obrigatório no primeiro acesso)
3. **Crie contas de usuário** para outros usuários (Configurações → Usuários)
4. **Atualize as integrações de API externas** para incluir autenticação (consulte [Alterações de API incompatíveis com versões anteriores](api-changes.md))
5. **Configure a retenção de log de auditoria** se necessário (Configurações → Log de Auditoria)

#### Se Você Estiver Bloqueado {/* #if-youre-locked-out */}

Use a ferramenta de recuperação do administrador:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte o [Guia de Recuperação do Administrador](../user-guide/admin-recovery.md) para obter detalhes.

### Atualizando para a Versão 0.8.x {/* #upgrading-to-version-08x */}

#### O Que Muda Automaticamente {/* #what-changes-automatically-1 */}

- Schema do banco de dados atualizado para v3.1
- Chave mestra gerada para criptografia (armazenada em `.duplistatus.key`)
- Sessões invalidadas (novas sessões protegidas por CSRF criadas)
- Senhas criptografadas usando novo sistema

#### O Que Você Deve Fazer {/* #what-you-must-do-1 */}

1. **Atualize os modelos de notificação** se você os personalizou:
   - Substitua `{backup_interval_value}` e `{backup_interval_type}` por `{backup_interval}`
   - Os modelos padrão são atualizados automaticamente

#### Notas de Segurança {/* #security-notes */}

- Garanta que o arquivo `.duplistatus.key` tenha backup (com permissões 0400)
- As sessões expiram após 24 horas

### Atualizando para a Versão 0.7.x {/* #upgrading-to-version-07x */}

#### O que Muda Automaticamente {/* #what-changes-automatically-2 */}

- Tabela `machines` renomeada para `servers`
- Campos `machine_id` renomeados para `server_id`
- Novos campos adicionados: `alias`, `notes`, `created_at`, `updated_at`

#### O que Você Deve Fazer {/* #what-you-must-do-2 */}

1. **Atualize as integrações de API externas**:
   - Altere `totalMachines` → `totalServers` em `/api/summary`
   - Altere `machine` → `server` em objetos de resposta da API
   - Altere `backup_types_count` → `backup_jobs_count` em `/api/lastbackups/{serverId}`
   - Atualize os caminhos dos endpoints de `/api/machines/...` para `/api/servers/...`
2. **Atualize os modelos de notificação**:
   - Substitua `{machine_name}` por `{server_name}`

Consulte [Alterações de API incompatíveis com versões anteriores](api-changes.md) para obter as etapas detalhadas de migração da API.

## Lista de Verificação Pós-Migração {/* #post-migration-checklist */}

Após a atualização, verifique:

- [ ] Todos os servidores aparecem corretamente no painel
- [ ] O histórico de backup está completo e acessível
- [ ] As notificações funcionam (teste NTFY/e-mail)
- [ ] As integrações de API externas funcionam (se aplicável)
- [ ] As configurações estão acessíveis e corretas
- [ ] O monitoramento de backup funciona corretamente
- [ ] Conectado com sucesso (0.9.x+)
- [ ] Alterou a senha padrão do administrador (0.9.x+)
- [ ] Criou contas de usuário para outros usuários (0.9.x+)
- [ ] Atualizou as integrações de API externas com autenticação (0.9.x+)

## Solução de problemas {/* #troubleshooting */}

### A Migração Falha {/* #migration-fails */}

1. Verifique o espaço em disco (backup requer espaço)
2. Verifique as permissões de escrita no diretório de dados
3. Revise os logs do contêiner para erros específicos
4. Restaure do backup se necessário (consulte Reversão abaixo)

### Dados Ausentes Após a Migração {/* #data-missing-after-migration */}

1. Verifique se o backup foi criado (verifique o diretório de dados)
2. Revise os logs do contêiner para mensagens de criação de backup
3. Verifique a integridade do arquivo de banco de dados

### Problemas de Autenticação (0.9.x+) {/* #authentication-issues-09x */}

1. Verifique se a conta de administrador padrão existe (verifique os logs)
2. Tente as credenciais padrão: `admin` / `Duplistatus09`
3. Use a ferramenta de recuperação de administrador se estiver bloqueado
4. Verifique se a tabela `users` existe no banco de dados

### Erros de API {/* #api-errors */}

1. Revise [Alterações de API incompatíveis com versões anteriores](api-changes.md) para atualizações de endpoints
2. Atualize integrações externas com novos nomes de campos
3. Adicione autenticação às solicitações de API (0.9.x+)
4. Teste endpoints de API após a migração

### Problemas de Chave Mestra (0.8.x+) {/* #master-key-issues-08x */}

1. Certifique-se de que o arquivo `.duplistatus.key` está acessível
2. Verifique se as permissões do arquivo são 0400
3. Verifique os logs do contêiner para erros de geração de chave

### Configuração de DNS do Podman {/* #podman-dns-configuration */}

Se você está usando Podman e enfrentando problemas de conectividade de rede após a atualização, pode ser necessário configurar as definições de DNS para seu contêiner. Consulte a [seção de configuração de DNS](../installation/installation.md#configuring-dns-for-podman-containers) no guia de instalação para obter detalhes.

## Procedimento de Reversão {/* #rollback-procedure */}

Se você precisar reverter para uma versão anterior:

1. **Interrompa o contêiner**: `docker stop <container-name>` (ou `podman stop <container-name>`)
2. **Localize seu backup**: 
   - Se você criou um backup usando a interface web (versão 1.2.1+), use esse arquivo de backup baixado
   - Se você criou um backup de volume manual, extraia-o primeiro
   - Os backups de migração automática estão localizados no diretório de dados (arquivos `.db` com timestamp)
3. **Restaure o banco de dados**: 
   - **Para backups da interface web (versão 1.2.1+)**: Use a função de restauração em `Settings → Database Maintenance` (consulte [Manutenção do Banco de Dados](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para backups manuais**: Substitua `backups.db` em seu diretório de dados/volume pelo arquivo de backup
4. **Use a versão anterior da imagem**: Faça pull e execute a imagem do contêiner anterior
5. **Inicie o contêiner**: Inicie com a versão anterior

:::warning
A reversão pode causar perda de dados se o esquema mais recente for incompatível com a versão anterior. Sempre certifique-se de ter um backup recente antes de tentar a reversão.
:::

### Solução de Problemas de Restauração / Reversão {/* #troubleshooting-your-restore--rollback */}

Se o aplicativo não iniciar ou seus dados não aparecerem após uma restauração ou reversão, verifique os seguintes problemas comuns:

#### 1. Permissões do Arquivo de Banco de Dados (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Se você restaurou o arquivo como o usuário `root`, o aplicativo dentro do contêiner pode não ter permissão para ler ou escrever nele.

* **O Sintoma:** Os logs mostram "Permissão Negada" ou "Banco de dados somente leitura".
* **A Solução:** Redefinir as permissões do arquivo dentro do contêiner para garantir que ele seja acessível.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nome de Arquivo Incorreto {/* #2-incorrect-filename */}

O aplicativo procura especificamente por um arquivo chamado `backups.db`.

* **O Sintoma:** O aplicativo inicia mas parece "vazio" (como uma instalação nova).
* **A Solução:** Verifique o diretório `/app/data/`. Se seu arquivo for nomeado `duplistatus-backup-2024.db` ou tiver uma extensão `.sqlite`, o aplicativo o ignorará. Use o comando `mv` ou a GUI do Docker Desktop para renomeá-lo exatamente para `backups.db`.

#### 3. Contêiner Não Reiniciado {/* #3-container-not-restarted */}

Em alguns sistemas, usar `docker cp` enquanto o contêiner está em execução pode não "atualizar" imediatamente a conexão da aplicação com o banco de dados.

* **A Solução:** Sempre execute uma reinicialização completa após uma restauração:

```bash
docker restart duplistatus
```

#### 4. Incompatibilidade de Versão de Banco de Dados {/* #4-database-version-mismatch */}

Se você estiver restaurando um backup de uma versão muito mais recente do duplistatus em uma versão mais antiga do aplicativo, o esquema do banco de dados pode ser incompatível.

* **A Solução:** Sempre certifique-se de que você está executando a mesma versão (ou uma versão mais recente) da imagem duplistatus que criou o backup. Verifique sua versão com:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versões de Esquema de Banco de Dados {/* #database-schema-versions */}

| Versão da Aplicação        | Versão do Esquema | Alterações Principais                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x e anteriores          | v1.0           | Esquema inicial                                     |
| 0.7.x                      | v2.0, v3.0     | Adicionadas configurações, máquinas renomeadas → servidores   |
| 0.8.x                      | v3.1           | Campos de backup aprimorados, suporte a criptografia         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Controle de acesso de usuário, autenticação, auditoria |

## Obtendo Ajuda {/* #getting-help */}

- **Documentação**: [Guia do Usuário](../user-guide/overview.md)
- **Referência de API**: [Documentação de API](../api-reference/overview.md)
- **Alterações de API**: [Alterações de API incompatíveis com versões anteriores](api-changes.md)
- **Notas de Versão**: Verifique as notas de versão específicas para alterações detalhadas
- **Comunidade**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

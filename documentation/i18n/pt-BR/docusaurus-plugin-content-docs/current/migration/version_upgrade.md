---
translation_last_updated: '2026-02-16T02:21:44.426Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: f18ae0bd1263eac9
translation_language: pt-BR
source_file_path: migration/version_upgrade.md
---
# Guia de Migração {#migration-guide}

Este guia explica como fazer upgrade entre versões do duplistatus. As migrações são automáticas—o esquema do banco de dados se atualiza automaticamente quando você inicia uma nova versão.

Etapas manuais são obrigatórias apenas se você tiver customizado Modelos de notificação (a versão 0.8.x alterou variáveis de modelo) ou Integrações de API externa que precisam ser atualizadas (a versão 0.7.x alterou nomes de campos da API, a versão 0.9.x requer autenticação).

## Visão geral {#overview}

duplistatus migra automaticamente o esquema do seu banco de dados ao fazer upgrade. O sistema:

1. Cria um backup do seu banco de dados antes de fazer alterações
2. Atualiza o esquema do banco de dados para a versão mais recente
3. Preserva todos os dados existentes (servidores, backups, configuração)
4. Verifica se a migração foi concluída com sucesso

## Fazendo Backup do Seu Banco de Dados Antes da Migração {#backing-up-your-database-before-migration}

Antes de atualizar para uma nova versão, é recomendado criar um backup de seu banco de dados. Isso garante que você possa restaurar seus dados se algo der errado durante o processo de migração.

### Se Você Estiver Executando a Versão 1.2.1 ou Posterior {#if-youre-running-version-121-or-later}

Use a função de backup do banco de dados integrada:

1. Navegue para [Configurações → Manutenção do banco de dados](../user-guide/settings/database-maintenance.md) na interface web
2. Na seção **Backup do banco de dados**, selecione um formato de backup:
   - **Arquivo de banco de dados (.db)**: Formato binário - backup mais rápido, preserva exatamente toda a estrutura do banco de dados
   - **Dump SQL (.sql)**: Formato de texto - instruções SQL legíveis para humanos
3. Clique em **Baixar backup**
4. O arquivo de backup será baixado para seu computador com um nome de arquivo com timestamp

Para mais detalhes, consulte a documentação de [Manutenção do banco de dados](../user-guide/settings/database-maintenance.md#database-backup).

### Se Você Está Executando uma Versão Anterior à 1.2.1 {#if-youre-running-a-version-before-121}

#### Backup {#backup}

Você deve fazer backup manual do banco de dados antes de prosseguir. O arquivo do banco de dados está localizado em `/app/data/backups.db` dentro do container.

##### Para Usuários Linux {#for-linux-users}
Se você está no Linux, não se preocupe em configurar contêineres auxiliares. Você pode usar o comando nativo `cp` para extrair o banco de dados diretamente do contêiner em execução para seu host.

###### Usando Docker ou Podman: {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Se estiver usando Podman, simplesmente substitua `docker` por `podman` no comando acima.)

##### Para Usuários do Windows {#for-windows-users}
Se você está executando o Docker Desktop no Windows, você tem duas maneiras simples de lidar com isso sem usar a linha de comando:

###### Opção A: Usar Docker Desktop (Mais Fácil) {#option-a-use-docker-desktop-easiest}
1. Abra o Painel do Docker Desktop.
2. Vá para a aba Containers e clique no seu container duplistatus.
3. Clique na aba Arquivos.
4. Navegue até `/app/data/`.
5. Clique com o botão direito em `backups.db` e selecione **Salvar como...** para baixá-lo para suas pastas do Windows.

###### Opção B: Usar PowerShell {#option-b-use-powershell}
Se você preferir o terminal, pode usar PowerShell para copiar o arquivo para sua Área de Trabalho:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Se Você Usar Bind Mounts {#if-you-use-bind-mounts}
Se você originalmente configurou seu container usando um bind mount (por exemplo, você mapeou uma pasta local como `/opt/duplistatus` para o container), você não precisa de comandos Docker. Apenas copie o arquivo usando seu gerenciador de arquivos:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplesmente copie o arquivo no **File Explorer** da pasta que você designou durante a configuração.

#### Restaurando Seus Dados {#restoring-your-data}
Se você precisar restaurar seu banco de dados a partir de um backup anterior, siga as etapas abaixo com base no seu sistema operacional.

:::info[IMPORTANTE] 
Parar o container antes de restaurar o banco de dados para evitar corrupção de arquivos.
:::

##### Para Usuários Linux {#for-linux-users}
A maneira mais fácil de restaurar é "enviar" o arquivo de backup de volta para o caminho de armazenamento interno do container.

###### Usando Docker ou Podman: {#using-docker-or-podman}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Para Usuários do Windows {#for-windows-users}
Se você está usando Docker Desktop, você pode realizar a restauração através da GUI ou PowerShell.

###### Opção A: Usar Docker Desktop (GUI) {#option-a-use-docker-desktop-gui}
1. Certifique-se de que o container duplistatus está Ativo (Docker Desktop requer que o container esteja ativo para subir arquivos via GUI).
2. Acesse a aba Arquivos nas configurações do seu container.
3. Navegue até `/app/data/`.
4. Clique com o botão direito no arquivo backups.db existente e selecione Excluir.
5. Clique no botão Importar (ou clique com o botão direito na área da pasta) e selecione seu arquivo de backup do seu computador.

Renomeie o arquivo importado para exatamente backups.db se ele tiver uma data e hora no nome.

Reinicie o container.

###### Opção B: Usar PowerShell {#option-b-use-powershell}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Se Você Usar Bind Mounts {#if-you-use-bind-mounts}
Se você estiver usando uma pasta local mapeada para o contêiner, não será necessário nenhum comando especial.

1. Parar o container.
2. Copiar manualmente seu arquivo de backup para sua pasta mapeada (por exemplo, `/opt/duplistatus` ou `C:\duplistatus_data`).
3. Garantir que o arquivo seja nomeado exatamente como `backups.db`.
4. Iniciar o container.

```bash
docker logs <container-name>
```

:::note
Se você restaurar o banco de dados manualmente, poderá encontrar erros de permissão. 

Verifique os logs do container e ajuste as permissões se necessário. Consulte a seção [Troubleshooting](#troubleshooting-your-restore--rollback) abaixo para mais informações.
::: 

## Processo de Migração Automática {#automatic-migration-process}

Quando você inicia uma nova versão, as migrações são executadas automaticamente:

1. **Criação de Backup**: Um backup com timestamp é criado no seu diretório de dados
2. **Atualização de Schema**: As tabelas e campos do banco de dados são atualizados conforme necessário
3. **Migração de Dados**: Todos os dados existentes são preservados e migrados
4. **Verificação**: O sucesso da migração é registrado

### Monitorando a Migração {#monitoring-migration}

Verifique os logs do Docker para monitorar o progresso da migração:


Procure por mensagens como:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de Migração Específicas da Versão {#version-specific-migration-notes}

### Atualizando para Versão 0.9.x ou Posterior (Schema v4.0) {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**Autenticação agora é obrigatória.** Todos os usuários devem entrar após a atualização.
:::

#### O Que Muda Automaticamente {#what-changes-automatically}

- Esquema de banco de dados migra de v3.1 para v4.0
- Novas tabelas criadas: `users`, `sessions`, `audit_log`
- Conta admin padrão criada automaticamente
- Todas as sessões existentes invalidadas

#### O Que Você Deve Fazer {#what-you-must-do}

1. **Entrar** com credenciais padrão de admin:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09`
2. **Altere a senha** quando solicitado (obrigatório no primeiro login)
3. **Criar usuários** para outros usuários (Configurações → Usuários)
4. **Atualizar integrações de API externas** para incluir autenticação (consulte [Mudanças incompatíveis com versões anteriores da API](api-changes.md))
5. **Configurar retenção de log de auditoria** se necessário (Configurações → Log de Auditoria)

#### Se Você Está Bloqueado {#if-youre-locked-out}

Utilize a ferramenta de recuperação do admin:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte o [Guia de Recuperação do Admin](../user-guide/admin-recovery.md) para Detalhes.

### Atualizando para a Versão 0.8.x {#upgrading-to-version-08x}

#### O Que Muda Automaticamente {#what-changes-automatically}

- Schema de banco de dados atualizado para v3.1
- Chave mestra gerada para criptografia (armazenada em `.duplistatus.key`)
- Sessões invalidadas (novas sessões protegidas por CSRF criadas)
- Senhas criptografadas usando novo sistema

#### O Que Você Deve Fazer {#what-you-must-do}

1. **Atualize os modelos de notificação** se você os personalizou:
   - Substitua `{backup_interval_value}` e `{backup_interval_type}` por `{backup_interval}`
   - Os modelos padrão são atualizados automaticamente

#### Notas de Segurança {#security-notes}

- Certifique-se de que o arquivo `.duplistatus.key` está com backup (possui permissões 0400)
- As sessões expiram após 24 horas

### Atualizando para a Versão 0.7.x {#upgrading-to-version-07x}

#### O Que Muda Automaticamente {#what-changes-automatically}

- tabela `machines` renomeada para `servers`
- campos `machine_id` renomeados para `server_id`
- Novos campos adicionados: `alias`, `notes`, `created_at`, `updated_at`

#### O Que Você Deve Fazer {#what-you-must-do}

1. **Atualizar integrações de API externa**:
   - Alterar `totalMachines` → `totalServers` em `/api/summary`
   - Alterar `machine` → `server` em objetos de resposta da API
   - Alterar `backup_types_count` → `backup_jobs_count` em `/api/lastbackups/{serverId}`
   - Atualizar caminhos de endpoint de `/api/machines/...` para `/api/servers/...`
2. **Atualizar modelos de notificação**:
   - Substituir `{machine_name}` por `{server_name}`

Consulte [Mudanças incompatíveis com versões anteriores da API](api-changes.md) para obter etapas detalhadas de migração de API.

## Lista de Verificação Pós-Migração {#post-migration-checklist}

Após a atualização, verificar:

- [ ] Todos os servidores aparecem corretamente no painel
- [ ] O histórico de backups está completo e acessível
- [ ] As notificações funcionam (testar NTFY/e-mail)
- [ ] As integrações de API externa funcionam (se aplicável)
- [ ] As configurações estão acessíveis e corretas
- [ ] O monitoramento de backup funciona corretamente
- [ ] Conectado com sucesso (0.9.x+)
- [ ] Alterou a senha padrão do admin (0.9.x+)
- [ ] Criou contas de usuário para outros usuários (0.9.x+)
- [ ] Atualizou as integrações de API externa com autenticação (0.9.x+)

## Solução de Problemas {#troubleshooting}

### Falha na Migração {#migration-fails}

1. Verificar espaço em disco (backup requer espaço)
2. Verificar permissões de escrita no diretório de dados
3. Revisar logs do container para erros específicos
4. Restaurar a partir do backup se necessário (consulte Rollback abaixo)

### Dados Ausentes Após Migração {#data-missing-after-migration}

1. Verificar se o backup foi criado (verificar diretório de dados)
2. Revisar os logs do container para mensagens de criação de backup
3. Verificar a integridade do arquivo de banco de dados

### Problemas de Autenticação (0.9.x+) {#authentication-issues-09x}

1. Verificar se a conta admin padrão existe (verificar logs)
2. Tentar credenciais padrão: `admin` / `Duplistatus09`
3. Usar ferramenta de recuperação de admin se bloqueado
4. Verificar se a tabela `users` existe no banco de dados

### Erros de API {#api-errors}

1. Revise [Mudanças incompatíveis com versões anteriores da API](api-changes.md) para atualizações de endpoint
2. Atualize integrações externas com novos nomes de campo
3. Adicione autenticação às solicitações de API (0.9.x+)
4. Teste endpoints de API após a migração

### Problemas de Chave Mestra (0.8.x+) {#master-key-issues-08x}

1. Garantir que o arquivo `.duplistatus.key` esteja acessível
2. Verificar se as permissões do arquivo são 0400
3. Verificar os logs do container para erros de geração de chave

### Configuração de DNS do Podman {#podman-dns-configuration}

Se você está usando Podman e enfrentando problemas de conectividade de rede após uma atualização, pode ser necessário configurar as definições de DNS para seu container. Consulte a [seção de configuração de DNS](../installation/installation.md#configuring-dns-for-podman-containers) no guia de instalação para detalhes.

## Procedimento de Reversão {#rollback-procedure}

Se você precisar reverter para uma versão anterior:

1. **Parar o container**: `docker stop <container-name>` (ou `podman stop <container-name>`)
2. **Encontre seu backup**: 
   - Se você criou um backup usando a interface web (versão 1.2.1+), use esse arquivo de backup baixado
   - Se você criou um backup de volume manual, extraia-o primeiro
   - Os backups de migração automática estão localizados no diretório de dados (arquivos `.db` com timestamp)
3. **Restaurar o banco de dados**: 
   - **Para backups da interface web (versão 1.2.1+)**: Use a função de restauração em `Configurações → Manutenção do banco de dados` (veja [Manutenção do banco de dados](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para backups manuais**: Substitua `backups.db` no seu diretório de dados/volume pelo arquivo de backup
4. **Use a versão anterior da imagem**: Faça pull e execute a imagem do container anterior
5. **Iniciar o container**: Inicie com a versão anterior

:::warning
A reversão pode causar perda de dados se o esquema mais recente for incompatível com a versão anterior. Sempre certifique-se de que você tem um backup recente antes de tentar reverter.
:::

### Solução de Problemas de Restauração / Reversão {#troubleshooting-your-restore--rollback}

Se o aplicativo não iniciar ou seus dados não aparecerem após uma restauração ou reversão, verifique os seguintes problemas comuns:

#### 1. Permissões de Arquivo do Banco de Dados (Linux/Podman) {#1-database-file-permissions-linuxpodman}

Se você restaurou o arquivo como o usuário `root`, a aplicação dentro do container pode não ter permissão para ler ou escrever nele.

* **O Sintoma:** Logs mostram "Permission Denied" ou "Read-only database."
* **A Solução:** Redefina as permissões do arquivo dentro do container para garantir que seja acessível.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nome de Arquivo Incorreto {#2-incorrect-filename}

A aplicação procura especificamente por um arquivo chamado `backups.db`.

* **O Sintoma:** A aplicação inicia mas aparece "vazia" (como uma instalação nova).
* **A Solução:** Verifique o diretório `/app/data/`. Se seu arquivo é nomeado `duplistatus-backup-2024.db` ou possui extensão `.sqlite`, a aplicação o ignorará. Use o comando `mv` ou a GUI do Docker Desktop para renomeá-lo exatamente para `backups.db`.

#### 3. Container Não Reiniciado {#3-container-not-restarted}

Em alguns sistemas, usar `docker cp` enquanto o container está em execução pode não "atualizar" imediatamente a conexão da aplicação com o banco de dados.

* **A Solução:** Sempre execute uma reinicialização completa após uma restauração:

```bash
docker restart duplistatus
```

#### 4. Incompatibilidade de Versão do Banco de Dados {#4-database-version-mismatch}

Se você está restaurando um backup de uma versão muito mais recente do duplistatus em uma versão mais antiga do aplicativo, o esquema do banco de dados pode ser incompatível.

* **A Solução:** Sempre certifique-se de que você está executando a mesma versão (ou uma versão mais recente) da imagem duplistatus que criou o backup. Verifique sua versão com:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versões do Schema de Banco de Dados {#database-schema-versions}

| Versão da Aplicação        | Versão do Schema | Principais Alterações                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x e anteriores          | v1.0           | Schema inicial                                     |
| 0.7.x                      | v2.0, v3.0     | Adicionadas configurações, servidores renomeados (máquinas → servidores)   |
| 0.8.x                      | v3.1           | Campos de backup aprimorados, suporte a criptografia         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Controle de acesso de usuário, autenticação, registro de auditoria |

## Ajuda {#getting-help}

- **Documentação**: [Guia do Usuário](../user-guide/overview.md)
- **Referência de API**: [Documentação da API](../api-reference/overview.md)
- **Mudanças de API**: [Mudanças incompatíveis com versões anteriores da API](api-changes.md)
- **Notas de Versão**: Verifique as notas de versão específicas para alterações detalhadas
- **Comunidade**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

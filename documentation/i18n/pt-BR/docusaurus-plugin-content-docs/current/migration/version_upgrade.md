# Guia de Migração

Este guia explica como fazer upgrade entre versões de duplistatus. As migrações são automáticas—o esquema do banco de dados se atualiza automaticamente quando você inicia uma nova versão.

Etapas manuais são necessárias apenas se você personalizou modelos de notificação (versão 0.8.x alterou variáveis de modelo) ou integrações de API externas que precisam de atualização (versão 0.7.x alterou nomes de campos de API, versão 0.9.x requer autenticação).

## Visão geral

duplistatus migra automaticamente seu esquema de banco de dados ao fazer upgrade. O sistema:

1. Cria um backup do seu banco de dados antes de fazer alterações
2. Atualiza o esquema do banco de dados para a versão mais recente
3. Preserva todos os dados existentes (servidores, backups, configuração)
4. Verifica se a migração foi concluída com sucesso

## Fazendo Backup do Seu Banco de Dados Antes da Migração

Antes de fazer upgrade para uma nova versão, é recomendado criar um backup do seu banco de dados. Isso garante que você possa restaurar seus dados se algo der errado durante o processo de migração.

### Se Você Está Executando a Versão 1.2.1 ou Posterior

Use a função de backup de banco de dados integrada:

1. Navegue até `Configurações → Manutenção do banco de dados` na interface web
2. Na seção **Backup do banco de dados**, selecione um formato de backup:
   - **Arquivo de banco de dados (.db)**: Formato binário - backup mais rápido, preserva toda a estrutura do banco de dados exatamente
   - **Dump SQL (.sql)**: Formato de texto - instruções SQL legíveis por humanos
3. Clique em `Baixar backup`
4. O arquivo de backup será baixado para seu computador com um nome de arquivo com data e hora

Para mais detalhes, consulte a documentação de [Manutenção do banco de dados](../user-guide/settings/database-maintenance.md#database-backup).

### Se Você Está Executando uma Versão Anterior a 1.2.1

#### Backup

Você deve fazer backup manual do banco de dados antes de prosseguir. O arquivo de banco de dados está localizado em `/app/data/backups.db` dentro do contêiner.

##### Para Usuários Linux

Se você está no Linux, não se preocupe em iniciar contêineres auxiliares. Você pode usar o comando nativo `cp` para extrair o banco de dados diretamente do contêiner em execução para seu host.

###### Usando Docker ou Podman:

```bash
# Substitua 'duplistatus' pelo nome real do seu contêiner se diferente
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Se estiver usando Podman, simplesmente substitua `docker` por `podman` no comando acima.)

##### Para Usuários Windows

Se você está executando Docker Desktop no Windows, você tem duas maneiras simples de lidar com isso sem usar a linha de comando:

###### Opção A: Use Docker Desktop (Mais Fácil)

1. Abra o Painel do Docker Desktop.
2. Vá para a aba Contêineres e clique no seu contêiner duplistatus.
3. Clique na aba Arquivos.
4. Navegue até `/app/data/`.
5. Clique com o botão direito em `backups.db` e selecione **Salvar como...** para baixá-lo para suas pastas do Windows.

###### Opção B: Use PowerShell

Se você preferir o terminal, você pode usar PowerShell para copiar o arquivo para sua Área de Trabalho:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Se Você Usar Bind Mounts

Se você configurou originalmente seu contêiner usando um bind mount (por exemplo, você mapeou uma pasta local como `/opt/duplistatus` para o contêiner), você não precisa de comandos Docker. Apenas copie o arquivo usando seu gerenciador de arquivos:

- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplesmente copie o arquivo no **Explorador de Arquivos** da pasta que você designou durante a configuração.

#### Restaurando Seus Dados

Se você precisar restaurar seu banco de dados de um backup anterior, siga as etapas abaixo com base no seu sistema operacional.

:::info[IMPORTANT]
Pare o contêiner antes de restaurar o banco de dados para evitar corrupção de arquivos.
:::

##### Para Usuários Linux

A maneira mais fácil de restaurar é "enviar" o arquivo de backup de volta para o caminho de armazenamento interno do contêiner.

###### Usando Docker ou Podman:

```bash
# parar o contêiner
docker stop duplistatus

# Substitua 'duplistatus-backup.db' pelo nome real do seu arquivo de backup
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Reiniciar o contêiner
docker start duplistatus
```

##### Para Usuários Windows

Se você estiver usando Docker Desktop, você pode executar a restauração via GUI ou PowerShell.

###### Opção A: Use Docker Desktop (GUI)

1. Certifique-se de que o contêiner duplistatus está Em Execução (Docker Desktop requer que o contêiner esteja ativo para fazer upload de arquivos via GUI).
2. Vá para a aba Arquivos nas configurações do seu contêiner.
3. Navegue até `/app/data/`.
4. Clique com o botão direito no backups.db existente e selecione Excluir.
5. Clique no botão Importar (ou clique com o botão direito na área da pasta) e selecione seu arquivo de backup do seu computador.

Renomeie o arquivo importado para exatamente backups.db se ele tiver um carimbo de data/hora no nome.

Reinicie o contêiner.

###### Opção B: Use PowerShell

```powershell
# Copie o arquivo de sua Área de Trabalho de volta para o contêiner
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Reiniciar o contêiner
docker start duplistatus
```

##### Se Você Usar Bind Mounts

Se você estiver usando uma pasta local mapeada para o contêiner, você não precisa de comandos especiais.

1. Pare o contêiner.
2. Copie manualmente seu arquivo de backup para sua pasta mapeada (por exemplo, `/opt/duplistatus` ou `C:\duplistatus_data`).
3. Certifique-se de que o arquivo é nomeado exatamente `backups.db`.
4. Inicie o contêiner.

:::note
Se você restaurar o banco de dados manualmente, você pode encontrar erros de permissão.

Verifique os logs do contêiner e ajuste as permissões se necessário. Consulte a seção [Solução de Problemas](#troubleshooting-your-restore--rollback) abaixo para mais informações.
:::

## Processo de Migração Automática

Quando você inicia uma nova versão, as migrações são executadas automaticamente:

1. **Criação de Backup**: Um backup com data e hora é criado em seu diretório de dados
2. **Atualização de Esquema**: Tabelas e campos do banco de dados são atualizados conforme necessário
3. **Migração de Dados**: Todos os dados existentes são preservados e migrados
4. **Verificação**: O sucesso da migração é registrado

### Monitorando a Migração

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

## Notas de Migração Específicas da Versão

### Fazendo Upgrade para Versão 0.9.x ou Posterior (Schema v4.0)

:::warning
**Autenticação agora é obrigatória.** Todos os usuários devem fazer login após fazer upgrade.
:::

#### O Que Muda Automaticamente

- O esquema do banco de dados migra de v3.1 para v4.0
- Novas tabelas criadas: `users`, `sessions`, `audit_log`
- Conta de admin padrão criada automaticamente
- Todas as sessões existentes invalidadas

#### O Que Você Deve Fazer

1. **Faça login** com credenciais de admin padrão:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09`
2. **Altere a senha** quando solicitado (obrigatório no primeiro login)
3. **Crie contas de usuário** para outros usuários (Configurações → Usuários)
4. **Atualize integrações de API externas** para incluir autenticação (consulte [Alterações Significativas de API](api-changes.md))
5. **Configure retenção de log de auditoria** se necessário (Configurações → Log de Auditoria)

#### Se Você Estiver Bloqueado

Use a ferramenta de recuperação de admin:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte [Guia de Recuperação de Admin](../user-guide/admin-recovery.md) para detalhes.

### Fazendo Upgrade para Versão 0.8.x

#### O Que Muda Automaticamente

- Esquema do banco de dados atualizado para v3.1
- Chave mestra gerada para criptografia (armazenada em `.duplistatus.key`)
- Sessões invalidadas (novas sessões protegidas por CSRF criadas)
- Senhas criptografadas usando novo sistema

#### O Que Você Deve Fazer

1. **Atualize modelos de notificação** se você os personalizou:
   - Substitua `{backup_interval_value}` e `{backup_interval_type}` por `{backup_interval}`
   - Modelos padrão são atualizados automaticamente

#### Notas de Segurança

- Certifique-se de que o arquivo `.duplistatus.key` é feito backup (tem permissões 0400)
- As sessões expiram após 24 horas

### Fazendo Upgrade para Versão 0.7.x

#### O Que Muda Automaticamente

- Tabela `machines` renomeada para `servers`
- Campos `machine_id` renomeados para `server_id`
- Novos campos adicionados: `alias`, `notes`, `created_at`, `updated_at`

#### O Que Você Deve Fazer

1. **Atualize integrações de API externas**:
   - Altere `totalMachines` → `totalServers` em `/api/summary`
   - Altere `machine` → `server` em objetos de resposta de API
   - Altere `backup_types_count` → `backup_jobs_count` em `/api/lastbackups/{serverId}`
   - Atualize caminhos de endpoint de `/api/machines/...` para `/api/servers/...`
2. **Atualize modelos de notificação**:
   - Substitua `{machine_name}` por `{server_name}`

Consulte [Alterações Significativas de API](api-changes.md) para etapas detalhadas de migração de API.

## Lista de Verificação Pós-Migração

Após fazer upgrade, verifique:

- [ ] Todos os servidores aparecem corretamente no painel
- [ ] O histórico de backup está completo e acessível
- [ ] As notificações funcionam (teste NTFY/e-mail)
- [ ] As integrações de API externas funcionam (se aplicável)
- [ ] As configurações estão acessíveis e corretas
- [ ] O monitoramento de backups atrasados funciona corretamente
- [ ] Fez login com sucesso (0.9.x+)
- [ ] Alterou a senha de admin padrão (0.9.x+)
- [ ] Criou contas de usuário para outros usuários (0.9.x+)
- [ ] Atualizou integrações de API externas com autenticação (0.9.x+)

## Solução de Problemas

### A Migração Falha

1. Verifique espaço em disco (backup requer espaço)
2. Verifique permissões de escrita no diretório de dados
3. Revise os logs do contêiner para erros específicos
4. Restaure do backup se necessário (consulte Reversão abaixo)

### Dados Faltando Após Migração

1. Verifique se o backup foi criado (verifique o diretório de dados)
2. Revise os logs do contêiner para mensagens de criação de backup
3. Verifique a integridade do arquivo de banco de dados

### Problemas de Autenticação (0.9.x+)

1. Verifique se a conta de admin padrão existe (verifique os logs)
2. Tente credenciais padrão: `admin` / `Duplistatus09`
3. Use a ferramenta de recuperação de admin se estiver bloqueado
4. Verifique se a tabela `users` existe no banco de dados

### Erros de API

1. Revise [Alterações Significativas de API](api-changes.md) para atualizações de endpoint
2. Atualize integrações externas com novos nomes de campo
3. Adicione autenticação às solicitações de API (0.9.x+)
4. Teste endpoints de API após a migração

### Problemas de Chave Mestra (0.8.x+)

1. Certifique-se de que o arquivo `.duplistatus.key` está acessível
2. Verifique se as permissões do arquivo são 0400
3. Verifique os logs do contêiner para erros de geração de chave

### Configuração de DNS do Podman

Se você estiver usando Podman e enfrentando problemas de conectividade de rede após fazer upgrade, você pode precisar configurar as definições de DNS para seu contêiner. Consulte a [seção de configuração de DNS](../installation/installation.md#configuring-dns-for-podman-containers) no guia de instalação para detalhes.

## Procedimento de Reversão

Se você precisar reverter para uma versão anterior:

1. **Pare o contêiner**: `docker stop <container-name>` (ou `podman stop <container-name>`)
2. **Encontre seu backup**:
   - Se você criou um backup usando a interface web (versão 1.2.1+), use esse arquivo de backup baixado
   - Se você criou um backup de volume manual, extraia-o primeiro
   - Os backups de migração automática estão localizados no diretório de dados (arquivos `.db` com data e hora)
3. **Restaure o banco de dados**:
   - **Para backups de interface web (versão 1.2.1+)**: Use a função de restauração em `Configurações → Manutenção do banco de dados` (consulte [Manutenção do banco de dados](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para backups manuais**: Substitua `backups.db` em seu diretório/volume de dados pelo arquivo de backup
4. **Use versão de imagem anterior**: Puxe e execute a imagem de contêiner anterior
5. **Inicie o contêiner**: Inicie com a versão anterior

:::warning
A reversão pode causar perda de dados se o esquema mais recente for incompatível com a versão anterior. Sempre certifique-se de ter um backup recente antes de tentar reversão.
:::

### Solução de Problemas de Sua Restauração / Reversão

Se o aplicativo não iniciar ou seus dados não aparecerem após uma restauração ou reversão, verifique os seguintes problemas comuns:

#### 1. Permissões de Arquivo de Banco de Dados (Linux/Podman)

Se você restaurou o arquivo como o usuário `root`, o aplicativo dentro do contêiner pode não ter permissão para ler ou escrever nele.

- **O Sintoma:** Os logs mostram "Permission Denied" ou "Read-only database."
- **A Correção:** Redefina as permissões do arquivo dentro do contêiner para garantir que seja acessível.

```bash
# Definir propriedade (geralmente UID 1000 ou o usuário do app)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Definir permissões de leitura/escrita
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nome de Arquivo Incorreto

O aplicativo procura especificamente por um arquivo nomeado `backups.db`.

- **O Sintoma:** O aplicativo inicia mas parece "vazio" (como uma instalação nova).
- **A Correção:** Verifique o diretório `/app/data/`. Se seu arquivo é nomeado `duplistatus-backup-2024.db` ou tem uma extensão `.sqlite`, o app o ignorará. Use o comando `mv` ou GUI do Docker Desktop para renomeá-lo exatamente para `backups.db`.

#### 3. Contêiner Não Reiniciado

Em alguns sistemas, usar `docker cp` enquanto o contêiner está em execução pode não "atualizar" imediatamente a conexão do aplicativo com o banco de dados.

- **A Correção:** Sempre execute uma reinicialização completa após uma restauração:

```bash
docker restart duplistatus
```

#### 4. Incompatibilidade de Versão de Banco de Dados

Se você estiver restaurando um backup de uma versão muito mais recente de duplistatus em uma versão mais antiga do app, o esquema do banco de dados pode ser incompatível.

- **A Correção:** Sempre certifique-se de que você está executando a mesma (ou uma versão mais recente) da imagem duplistatus que a que criou o backup. Verifique sua versão com:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versões de Esquema de Banco de Dados

| Versão do Aplicativo                                                                                                                                                                              | Versão do Esquema                          | Alterações Principais                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| 0.6.x e anterior                                                                                                                                                  | v1.0                       | Esquema inicial                                               |
| 0.7.x                                                                                                                                                             | v2.0, v3.0 | Adicionadas configurações, máquinas renomeadas → servidores   |
| 0.8.x                                                                                                                                                             | v3.1                       | Campos de backup aprimorados, suporte a criptografia          |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0                       | Controle de acesso de usuário, autenticação, log de auditoria |

## Obtendo Ajuda

- **Documentação**: [Guia do Usuário](../user-guide/overview.md)
- **Referência de API**: [Documentação de API](../api-reference/overview.md)
- **Alterações de API**: [Alterações Significativas de API](api-changes.md)
- **Notas de Lançamento**: Verifique as notas de lançamento específicas da versão para alterações detalhadas
- **Comunidade**: [Discussões do GitHub](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [Problemas do GitHub](https://github.com/wsj-br/duplistatus/issues)

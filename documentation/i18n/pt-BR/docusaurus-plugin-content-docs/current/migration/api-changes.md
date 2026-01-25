# Alterações Incompatíveis da API

Este documento descreve as alterações incompatíveis nos endpoints de API externos nas diferentes versões do duplistatus. Os endpoints de API externos são aqueles projetados para uso por outras aplicações e integrações (por exemplo, integração com Homepage).

## Visão geral

Este documento cobre as alterações incompatíveis nos endpoints de API externos que afetam integrações, scripts e aplicações que consomem esses endpoints. Para endpoints de API internos usados pela interface web, as alterações são tratadas automaticamente e não requerem atualizações manuais.

:::note
Os endpoints de API externos são mantidos retrocompatíveis quando possível. Alterações incompatíveis só são introduzidas quando necessárias para consistência, segurança ou melhorias de funcionalidade.
:::

## Alterações por Versão

### Versão 1.3.0

**Sem alterações incompatíveis nos endpoints de API externos**

### Versão 1.2.1

**Sem alterações incompatíveis nos endpoints de API externos**


### Versão 1.1.x

**Sem alterações incompatíveis nos endpoints de API externos**

### Versão 1.0.x

**Sem alterações incompatíveis nos endpoints de API externos**


### Versão 0.9.x

**Sem alterações incompatíveis nos endpoints de API externos**

A versão 0.9.x introduz autenticação e requer que todos os usuários façam login. Ao atualizar da versão 0.8.x:

1. **Autenticação obrigatória**: Todas as páginas e endpoints de API internos agora requerem autenticação
2. **Conta de administrador padrão**: Uma conta de administrador padrão é criada automaticamente:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09` (deve ser alterada no primeiro login)
3. **Invalidação de sessões**: Todas as sessões existentes são invalidadas
4. **Acesso à API externa**: Os endpoints de API externos (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecem sem autenticação para compatibilidade com integrações e Duplicati

### Versão 0.8.x

**Sem alterações incompatíveis nos endpoints de API externos**

A versão 0.8.x não introduz alterações incompatíveis nos endpoints de API externos. Os seguintes endpoints permanecem inalterados:

- `/api/summary` - Estrutura de resposta inalterada
- `/api/lastbackup/{serverId}` - Estrutura de resposta inalterada
- `/api/lastbackups/{serverId}` - Estrutura de resposta inalterada
- `/api/upload` - Formato de requisição/resposta inalterado

#### Melhorias de segurança

Embora nenhuma alteração incompatível tenha sido feita nos endpoints de API externos, a versão 0.8.x inclui melhorias de segurança:

- **Proteção CSRF**: A validação de token CSRF é aplicada para requisições de API que modificam estado, mas as APIs externas permanecem compatíveis
- **Segurança de senhas**: Os endpoints de senha são restritos à interface do usuário por razões de segurança

:::note
Essas melhorias de segurança não afetam os endpoints de API externos usados para ler dados de backup. Se você tem scripts personalizados que usam endpoints internos, eles podem requerer tratamento de tokens CSRF.
:::

### Versão 0.7.x

A versão 0.7.x introduz várias alterações incompatíveis nos endpoints de API externos que requerem atualizações nas integrações externas.

#### Alterações Incompatíveis

##### Renomeação de campos

- **`totalMachines`** → **`totalServers`** no endpoint `/api/summary`
- **`machine`** → **`server`** nos objetos de resposta da API
- **`backup_types_count`** → **`backup_jobs_count`** no endpoint `/api/lastbackups/{serverId}`

##### Alterações nos caminhos de endpoints

- Todos os endpoints de API que usavam `/api/machines/...` agora usam `/api/servers/...`
- Os nomes de parâmetros mudaram de `machine_id` para `server_id` (a codificação URL ainda funciona com ambos)

#### Alterações na estrutura de resposta

A estrutura de resposta para vários endpoints foi atualizada para maior consistência:

##### `/api/summary`

**Antes (0.6.x e anterior):**
```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**Depois (0.7.x+):**
```json
{
  "totalServers": 3,  // Alterado de "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}`

**Antes (0.6.x e anterior):**
```json
{
  "machine": {  // Alterado para "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... detalhes do backup
  },
  "status": 200
}
```

**Depois (0.7.x+):**
```json
{
  "server": {  // Alterado de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... detalhes do backup
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Antes (0.6.x e anterior):**
```json
{
  "machine": {  // Alterado para "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de backups
  ],
  "backup_types_count": 2,  // Alterado para "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Depois (0.7.x+):**
```json
{
  "server": {  // Alterado de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de backups
  ],
  "backup_jobs_count": 2,  // Alterado de "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Etapas de migração

Se você está atualizando de uma versão anterior à 0.7.x, siga estas etapas:

1. **Atualizar referências de campos**: Substitua todas as referências aos nomes de campos antigos pelos novos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Atualizar chaves de objeto**: Altere `machine` para `server` ao analisar respostas
   - Atualize qualquer código que acesse `response.machine` para `response.server`

3. **Atualizar caminhos de endpoints**: Altere todos os endpoints que usam `/api/machines/...` para `/api/servers/...`
   - Nota: Os parâmetros ainda podem aceitar identificadores antigos; os caminhos devem ser atualizados

4. **Testar a integração**: Verifique se sua integração funciona com a nova estrutura da API
   - Teste todos os endpoints que sua aplicação usa
   - Verifique se a análise de respostas trata corretamente os novos nomes de campos

5. **Atualizar documentação**: Atualize qualquer documentação interna que faça referência à API antiga
   - Atualize exemplos de API e referências de nomes de campos

## Compatibilidade

### Retrocompatibilidade

- **Versão 1.2.1**: Totalmente retrocompatível com a estrutura da API 1.1.x
- **Versão 1.1.x**: Totalmente retrocompatível com a estrutura da API 1.0.x
- **Versão 1.0.x**: Totalmente retrocompatível com a estrutura da API 0.9.x
- **Versão 0.9.x**: Totalmente retrocompatível com a estrutura da API 0.8.x
- **Versão 0.8.x**: Totalmente retrocompatível com a estrutura da API 0.7.x
- **Versão 0.7.x**: Não retrocompatível com versões anteriores à 0.7.x
  - Os nomes de campos antigos não funcionarão
  - Os caminhos de endpoints antigos não funcionarão

### Suporte futuro

- Os nomes de campos antigos de versões anteriores à 0.7.x não são suportados
- Os caminhos de endpoints antigos de versões anteriores à 0.7.x não são suportados
- As versões futuras manterão a estrutura da API atual a menos que alterações incompatíveis sejam necessárias

## Resumo dos endpoints de API externos

Os seguintes endpoints de API externos são mantidos para retrocompatibilidade e permanecem sem autenticação:

| Endpoint | Método | Descrição | Alterações incompatíveis |
|----------|--------|-----------|-------------------------|
| `/api/summary` | GET | Resumo geral das operações de backup | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último backup para um servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos backups para todos os jobs | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Enviar dados de backup do Duplicati | Sem alterações incompatíveis |

## Precisa de ajuda?

Se você precisa de assistência para atualizar sua integração:

- **Referência da API**: Consulte a [Referência da API](../api-reference/overview.md) para documentação atual dos endpoints
- **APIs externas**: Veja [APIs externas](../api-reference/external-apis.md) para documentação detalhada dos endpoints
- **Guia de migração**: Revise o [Guia de migração](version_upgrade.md) para informações gerais de migração
- **Notas de versão**: Revise as [Notas de versão](../release-notes/0.8.x.md) específicas para contexto adicional
- **Suporte**: Abra uma issue no [GitHub](https://github.com/wsj-br/duplistatus/issues) para obter suporte

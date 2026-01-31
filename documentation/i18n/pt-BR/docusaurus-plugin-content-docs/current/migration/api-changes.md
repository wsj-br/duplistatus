---
translation_last_updated: '2026-01-31T00:51:30.652Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 42ca049a94e01f4c
translation_language: pt-BR
source_file_path: migration/api-changes.md
---
# Alterações Críticas da API {#api-breaking-changes}

Este documento descreve mudanças significativas nos endpoints da API externa em diferentes versões do duplistatus. Os endpoints da API externa são aqueles projetados para uso por outras aplicações e integrações (por exemplo, integração de Homepage).

## Visão Geral {#overview}

Este documento aborda mudanças significativas nos endpoints da API externa que afetam integrações, scripts e aplicações que consomem esses endpoints. Para endpoints da API interna usados pela interface web, as alterações são tratadas automaticamente e não requerem atualizações manuais.

:::note
Os endpoints da API externa são mantidos para compatibilidade com versões anteriores quando possível. Alterações significativas são introduzidas apenas quando necessárias para melhorias de consistência, segurança ou funcionalidade.
:::

## Alterações Específicas da Versão {#version-specific-changes}

### Versão 1.3.0 {#version-130}

**Não há alterações significativas nos pontos de extremidade da API externa**

### Versão 1.2.1 {#version-121}

**Não há alterações significativas nos pontos de extremidade da API externa**

### Versão 1.1.x {#version-11x}

**Não há alterações significativas nos pontos de extremidade da API externa**

### Versão 1.0.x {#version-10x}

**Não há alterações significativas nos pontos de extremidade da API externa**

### Versão 0.9.x {#version-09x}

**Não há alterações significativas nos pontos de extremidade da API externa**

Versão 0.9.x introduz autenticação e requer que todos os usuários entrem. Quando atualizar da versão 0.8.x:

1. **Autenticação Obrigatória**: Todas as páginas e endpoints de API interna agora exigem autenticação
2. **Conta Admin Padrão**: Uma conta admin padrão é criada automaticamente:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09` (deve ser alterada no primeiro login)
3. **Invalidação de Sessão**: Todas as sessões existentes são invalidadas
4. **Acesso de API Externa**: Os endpoints de API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecem sem autenticação para compatibilidade com Integrações e Duplicati

### Versão 0.8.x {#version-08x}

**Não há alterações significativas nos pontos de extremidade da API externa**

Versão 0.8.x não introduz nenhuma mudança significativa nos endpoints da API externa. Os seguintes endpoints permanecem inalterados:

- `/api/summary` - Estrutura de resposta inalterada
- `/api/lastbackup/{serverId}` - Estrutura de resposta inalterada
- `/api/lastbackups/{serverId}` - Estrutura de resposta inalterada
- `/api/upload` - Formato de solicitação/resposta inalterado

#### Melhorias de Segurança {#security-enhancements}

Embora nenhuma alteração significativa tenha sido feita nos endpoints da API externa, a versão 0.8.x inclui melhorias de Segurança:

- **Proteção CSRF**: A validação de token CSRF é aplicada para requisições de API que alteram estado, mas APIs externas permanecem compatíveis
- **Segurança de Senha**: Os endpoints de Senha são restritos à interface do usuário por razões de segurança

:::note
Estes aprimoramentos de Segurança não afetam os endpoints de API externos usados para leitura de dados de backup. Se você possui scripts personalizados usando endpoints internos, eles podem exigir tratamento de token CSRF.
:::

### Versão 0.7.x {#version-07x}

Versão 0.7.x introduz várias mudanças significativas nos endpoints da API externa que exigem atualizações nas integrações externas.

#### Mudanças Significativas {#breaking-changes}

##### Renomeação de Campo {#field-renaming}

- **`totalMachines`** → **`totalServers`** no endpoint `/api/summary`
- **`machine`** → **`server`** nos objetos de resposta da API
- **`backup_types_count`** → **`backup_jobs_count`** no endpoint `/api/lastbackups/{serverId}`

##### Alterações no Caminho do Endpoint {#endpoint-path-changes}

- Todos os endpoints da API que anteriormente usavam `/api/machines/...` agora usam `/api/servidores/...`
- Os nomes de parâmetros foram alterados de `machine_id` para `server_id` (a codificação de URL ainda funciona com ambos)

#### Alterações na Estrutura de Resposta {#response-structure-changes}

A estrutura de resposta para vários endpoints foi atualizada para consistência:

##### `/api/summary` {#apisummary}

**Antes (0.6.x e anteriores):**

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
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

**Antes (0.6.x e anteriores):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**Depois (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

**Antes (0.6.x e anteriores):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Depois (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Etapas de Migração {#migration-steps}

Se você está atualizando de uma versão anterior à 0.7.x, siga estas etapas:

# Atualizar Referências de Campo

1. **Atualizar Referências de Campo**: Substitua todas as referências aos nomes de campo antigos pelos novos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Atualizar Chaves de Objeto**: Altere `machine` para `server` na análise de resposta
   - Atualize qualquer código que acesse `response.machine` para `response.server`

3. **Atualizar Caminhos de Endpoint**: Altere qualquer endpoint usando `/api/machines/...` para `/api/servers/...`
   - Nota: Os parâmetros ainda podem aceitar identificadores antigos; os caminhos devem ser atualizados

4. **Testar Integração**: Verificar que sua integração funciona com a nova estrutura de API
   - Testar todos os endpoints que sua aplicação utiliza
   - Verificar que a análise de resposta trata corretamente os novos nomes de campos

5. **Atualizar Documentação**: Atualize qualquer documentação interna que faça referência à API antiga
   - Atualize exemplos de API e referências de nomes de campos

## Compatibilidade {#compatibility}

### Compatibilidade com Versões Anteriores {#backward-compatibility}

- **Versão 1.2.1**: Totalmente compatível com versões anteriores da estrutura da API 1.1.x
- **Versão 1.1.x**: Totalmente compatível com versões anteriores da estrutura da API 1.0.x
- **Versão 1.0.x**: Totalmente compatível com versões anteriores da estrutura da API 0.9.x
- **Versão 0.9.x**: Totalmente compatível com versões anteriores da estrutura da API 0.8.x
- **Versão 0.8.x**: Totalmente compatível com versões anteriores da estrutura da API 0.7.x
- **Versão 0.7.x**: Não é compatível com versões anteriores a 0.7.x
  - Nomes de campos antigos não funcionarão
  - Caminhos de endpoints antigos não funcionarão

### Suporte Futuro {#future-support}

- Nomes de campos antigos de versões anteriores à 0.7.x não são suportados
- Caminhos de endpoint antigos de versões anteriores à 0.7.x não são suportados
- Versões futuras manterão a estrutura de API atual, a menos que mudanças significativas sejam necessárias

## Resumo dos Endpoints da API Externa {#summary-of-external-api-endpoints}

Os seguintes endpoints de API externa são mantidos para compatibilidade com versões anteriores e permanecem sem autenticação:

| Endpoint | Method | Descrição | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Resumo geral de operações de backup | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último backup para um servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos backups para todos os trabalhos de backup | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir dados de backup do Duplicati | Não há breaking changes |

## Precisa de Ajuda? {#need-help}

Se você precisar de assistência para atualizar sua integração:

- **Referência de API**: Verifique a [Referência de API](../api-reference/overview.md) para documentação de endpoints atual
- **APIs Externas**: Consulte [APIs Externas](../api-reference/external-apis.md) para documentação detalhada de endpoints
- **Guia de Migração**: Revise o [Guia de Migração](version_upgrade.md) para informações gerais de migração
- **Notas de Lançamento**: Revise as [Notas de Lançamento](../release-notes/0.8.x.md) específicas da versão para contexto adicional
- **Suporte**: Abra uma issue no [GitHub](https://github.com/wsj-br/duplistatus/issues) para suporte

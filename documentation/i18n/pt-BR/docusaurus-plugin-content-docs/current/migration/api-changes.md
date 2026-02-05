---
translation_last_updated: '2026-02-05T19:09:05.432Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 42ca049a94e01f4c
translation_language: pt-BR
source_file_path: migration/api-changes.md
---
# Mudanças Quebradas da API {#api-breaking-changes}

Este documento descreve mudanças significativas nos endpoints da API externa em diferentes versões do duplistatus. Os endpoints da API externa são aqueles projetados para uso por outras aplicações e integrações (por exemplo, integração de Homepage).

## Visão geral {#overview}

Este documento aborda mudanças significativas nos endpoints da API externa que afetam integrações, scripts e aplicações que consomem esses endpoints. Para endpoints da API interna usados pela interface web, as alterações são tratadas automaticamente e não requerem atualizações manuais.

:::note
Os endpoints da API externa são mantidos para compatibilidade com versões anteriores quando possível. Mudanças significativas são introduzidas apenas quando necessárias para melhorias de consistência, segurança ou funcionalidade.
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

A Versão 0.9.x introduz autenticação e requer que todos os usuários entrem. Quando atualizar da versão 0.8.x:

1. **Autenticação Obrigatória**: Todas as páginas e endpoints de API interna agora requerem autenticação
2. **Conta Admin Padrão**: Uma conta admin padrão é criada automaticamente:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09` (deve ser alterada no primeiro login)
3. **Invalidação de Sessão**: Todas as sessões existentes são invalidadas
4. **Acesso à API Externa**: Os endpoints de API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecem sem autenticação para compatibilidade com integrações e Duplicati

### Versão 0.8.x {#version-08x}

**Não há alterações significativas nos pontos de extremidade da API externa**

Versão 0.8.x não introduz nenhuma alteração significativa nos endpoints da API externa. Os seguintes endpoints permanecem inalterados:

- `/api/summary` - Estrutura de resposta inalterada
- `/api/lastbackup/{serverId}` - Estrutura de resposta inalterada
- `/api/lastbackups/{serverId}` - Estrutura de resposta inalterada
- `/api/upload` - Formato de requisição/resposta inalterado

#### Melhorias de Segurança {#security-enhancements}

Embora nenhuma alteração significativa tenha sido feita aos endpoints da API externa, a versão 0.8.x inclui melhorias de segurança:

- **Proteção CSRF**: A validação de token CSRF é aplicada para requisições de API que alteram estado, mas APIs externas permanecem compatíveis
- **Segurança de Senha**: Os endpoints de senha são restritos à interface do usuário por razões de segurança

:::note
Estes aprimoramentos de segurança não afetam os endpoints da API externa usados para leitura de dados de backup. Se você tiver scripts personalizados usando endpoints internos, eles podem exigir tratamento de token CSRF.
:::

### Versão 0.7.x {#version-07x}

A Versão 0.7.x introduz várias mudanças significativas nos endpoints da API externa que exigem atualizações nas Integrações externas.

#### Mudanças Significativas {#breaking-changes}

##### Renomeação de Campo {#field-renaming}

- **`totalMachines`** → **`totalServers`** no endpoint `/api/summary`
- **`machine`** → **`server`** nos objetos de resposta da API
- **`backup_types_count`** → **`backup_jobs_count`** no endpoint `/api/lastbackups/{serverId}`

##### Mudanças no Caminho do Endpoint {#endpoint-path-changes}

- Todos os endpoints de API que anteriormente usavam `/api/machines/...` agora usam `/api/servers/...`
- Nomes de parâmetros alterados de `machine_id` para `server_id` (a codificação de URL ainda funciona com ambos)

#### Mudanças na Estrutura de Resposta {#response-structure-changes}

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

1. **Atualizar Referências de Campo**: Substitua todas as referências aos nomes de campo antigos pelos novos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Atualizar Chaves de Objeto**: Altere `machine` para `server` na análise de resposta
   - Atualize qualquer código que acesse `response.machine` para `response.server`

3. **Atualizar Caminhos de Endpoint**: Altere qualquer endpoint usando `/api/machines/...` para `/api/servers/...`
   - Nota: Os parâmetros ainda podem aceitar identificadores antigos; os caminhos devem ser atualizados

4. **Integração de Testes**: Verificar que sua integração funciona com a nova estrutura de API
   - Testar todos os endpoints que sua aplicação utiliza
   - Verificar se a análise de resposta trata corretamente os novos nomes de campos

5. **Atualizar Documentação**: Atualize qualquer documentação interna que faça referência à API antiga
   - Atualize exemplos de API e referências de nomes de campos

## Compatibilidade {#compatibility}

### Compatibilidade com Versões Anteriores {#backward-compatibility}

- **Versão 1.2.1**: Totalmente compatível com versões anteriores da estrutura da API 1.1.x
- **Versão 1.1.x**: Totalmente compatível com versões anteriores da estrutura da API 1.0.x
- **Versão 1.0.x**: Totalmente compatível com versões anteriores da estrutura da API 0.9.x
- **Versão 0.9.x**: Totalmente compatível com versões anteriores da estrutura da API 0.8.x
- **Versão 0.8.x**: Totalmente compatível com versões anteriores da estrutura da API 0.7.x
- **Versão 0.7.x**: Não é compatível com versões anteriores à 0.7.x
  - Nomes de campos antigos não funcionarão
  - Caminhos de endpoints antigos não funcionarão

### Suporte Futuro {#future-support}

- Nomes de campos antigos de versões anteriores à 0.7.x não são suportados
- Caminhos de endpoint antigos de versões anteriores à 0.7.x não são suportados
- Versões futuras manterão a estrutura de API atual, a menos que alterações significativas sejam necessárias

## Resumo dos Endpoints da API Externa {#summary-of-external-api-endpoints}

Os seguintes endpoints de API externa são mantidos para compatibilidade com versões anteriores e permanecem não autenticados:

| Endpoint | Method | Descrição | Breaking Changes |
|----------|--------|-----------|------------------|
| `/api/summary` | GET | Resumo geral de operações de backup | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último backup para um servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos backups para todos os trabalhos de backup | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir dados de backup do Duplicati | Não há breaking changes |

## Precisa de Ajuda? {#need-help}

Se você precisa de assistência para atualizar sua integração:

- **Referência da API**: Verificar a [Referência da API](../api-reference/overview.md) para documentação atual dos endpoints
- **APIs Externas**: Consulte [APIs Externas](../api-reference/external-apis.md) para documentação detalhada dos endpoints
- **Guia de Migração**: Revise o [Guia de Migração](version_upgrade.md) para informações gerais de migração
- **Notas de Lançamento**: Revise as [Notas de Lançamento](../release-notes/0.8.x.md) específicas da versão para contexto adicional
- **Suporte**: Abra uma issue no [GitHub](https://github.com/wsj-br/duplistatus/issues) para suporte

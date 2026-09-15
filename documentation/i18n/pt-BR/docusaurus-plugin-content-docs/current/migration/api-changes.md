# Alterações incompatíveis com versões anteriores na API {/* #backward-incompatible-api-changes */}

Este documento descreve as alterações incompatíveis com versões anteriores nos pontos de extremidade da API externa em diferentes versões do duplistatus. Os pontos de extremidade da API externa são aqueles projetados para uso por outros aplicativos e integrações (por exemplo, integração com a página inicial).

## Visão Geral {/* #overview */}

Este documento abrange as alterações incompatíveis com versões anteriores nos pontos de extremidade da API externa que afetam integrações, scripts e aplicativos que consomem esses pontos de extremidade. Para os pontos de extremidade da API interna usados pela interface da web, as alterações são tratadas automaticamente e não exigem atualizações manuais.

:::note
Os pontos de extremidade da API externa são mantidos para compatibilidade com versões anteriores sempre que possível. Alterações incompatíveis são introduzidas apenas quando necessário para consistência, segurança ou melhorias de funcionalidade.
:::

## Alterações específicas de versão {/* #version-specific-changes */}

### Versão 1.3.0 {/* #version-130 */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

### Versão 1.2.1 {/* #version-121 */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

### Versão 1.1.x {/* #version-11x */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

### Versão 1.0.x {/* #version-10x */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

### Versão 0.9.x {/* #version-09x */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

A versão 0.9.x introduz autenticação e exige que todos os usuários façam login. Ao atualizar da versão 0.8.x:

1. **Autenticação obrigatória**: Todas as páginas e pontos de extremidade da API interna agora exigem autenticação
2. **Conta de administrador padrão**: Uma conta de administrador padrão é criada automaticamente:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09` (deve ser alterada no primeiro login)
3. **Invalidar sessão**: Todas as sessões existentes são invalidadas
4. **Acesso à API externa**: Os pontos de extremidade da API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecem não autenticados para compatibilidade com integrações e Duplicati

### Versão 0.8.x {/* #version-08x */}

**Nenhuma alteração incompatível com versões anteriores nos pontos de extremidade da API externa**

A versão 0.8.x não introduz alterações que quebrem a compatibilidade com os endpoints de API externos. Os seguintes endpoints permanecem inalterados:

- `/api/summary` - Estrutura de resposta inalterada
- `/api/lastbackup/{serverId}` - Estrutura de resposta inalterada
- `/api/lastbackups/{serverId}` - Estrutura de resposta inalterada
- `/api/upload` - Formato de solicitação/resposta inalterado

#### Melhorias de Segurança {/* #security-enhancements */}

Embora não tenham sido feitas alterações que quebrem a compatibilidade com os endpoints de API externos, a versão 0.8.x inclui melhorias de segurança:

- **Proteção CSRF**: A validação de token CSRF é exigida para solicitações de API que alteram o estado, mas as APIs externas permanecem compatíveis
- **Segurança de Senha**: Os endpoints de senha são restritos à interface do usuário por razões de segurança

:::note
Essas melhorias de segurança não afetam os endpoints de API externos usados para leitura de dados de backup. Se você tiver scripts personalizados usando endpoints internos, eles podem exigir o tratamento de token CSRF.
:::

### Versão 0.7.x {/* #version-07x */}

A versão 0.7.x introduz várias alterações que quebrem a compatibilidade com os endpoints de API externos, exigindo atualizações em integrações externas.

#### Alterações que Quebram a Compatibilidade {/* #breaking-changes */}

##### Renomeação de Campos {/* #field-renaming */}

- `totalMachines` → `totalServers` no endpoint `/api/summary`
- `machine` → `server` em objetos de resposta da API
- `backup_types_count` → `backup_jobs_count` no endpoint `/api/lastbackups/{serverId}`

##### Alterações nos Caminhos dos Endpoints {/* #endpoint-path-changes */}

- Todos os endpoints de API que anteriormente usavam `/api/machines/...` agora usam `/api/servers/...`
- Nomes de parâmetros alterados de `machine_id` para `server_id` (a codificação de URL ainda funciona com ambos)

#### Alterações na Estrutura de Resposta {/* #response-structure-changes */}

A estrutura de resposta para vários endpoints foi atualizada para garantir consistência:

##### `/api/summary` {/* #apisummary */}

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

**Após (0.7.x+):**

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

##### `/api/lastbackup/{serverId}` {/* #apilastbackupserverid */}

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

**Após (0.7.x+):**

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

##### `/api/lastbackups/{serverId}` {/* #apilastbackupsserverid */}

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

**Após (0.7.x+):**

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

## Passos de Migração {/* #migration-steps */}

Se você estiver atualizando de uma versão anterior à 0.7.x, siga estas etapas:

1. **Atualizar Referências de Campo**: Substitua todas as referências aos nomes de campo antigos pelos novos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Atualizar Chaves de Objeto**: Altere `machine` para `server` na análise de resposta
   - Atualize qualquer código que acesse `response.machine` para `response.server`

3. **Atualizar Caminhos de Endpoint**: Altere qualquer endpoint que use `/api/machines/...` para `/api/servers/...`
   - Nota: Os parâmetros ainda podem aceitar identificadores antigos; os caminhos devem ser atualizados

4. **Testar Integração**: Verifique se sua integração funciona com a nova estrutura da API
   - Teste todos os endpoints que seu aplicativo usa
   - Verifique se a análise de resposta lida corretamente com os novos nomes de campo

5. **Atualizar Documentação**: Atualize qualquer documentação interna que faça referência à API antiga
   - Atualize exemplos de API e referências de nomes de campo

## Compatibilidade {/* #compatibility */}

### Compatibilidade com Versões Anteriores {/* #backward-compatibility */}

- **Versão 1.2.1**: Totalmente compatível com a estrutura da API 1.1.x
- **Versão 1.1.x**: Totalmente compatível com a estrutura da API 1.0.x
- **Versão 1.0.x**: Totalmente compatível com a estrutura da API 0.9.x
- **Versão 0.9.x**: Totalmente compatível com a estrutura da API 0.8.x
- **Versão 0.8.x**: Totalmente compatível com a estrutura da API 0.7.x
- **Versão 0.7.x**: Não compatível com versões anteriores à 0.7.x
  - Os nomes de campo antigos não funcionarão
  - Os caminhos de endpoint antigos não funcionarão

### Suporte Futuro {/* #future-support */}

- Os nomes de campo antigos de versões pré-0.7.x não são suportados
- Os caminhos de endpoint antigos de versões pré-0.7.x não são suportados
- Versões futuras manterão a estrutura atual da API, a menos que alterações significativas sejam necessárias

## Resumo dos Endpoints da API Externa {/* #summary-of-external-api-endpoints */}

Os seguintes endpoints da API externa são mantidos para compatibilidade com versões anteriores e permanecem não autenticados:

| Endpoint | Método | Descrição | Alterações Significativas |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Resumo geral das operações de backup | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último backup para um servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos backups para todos os trabalhos de backup | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Carregar dados de backup do Duplicati | Sem alterações de compatibilidade |

## Precisa de ajuda? {/* #need-help */}

Se você precisar de assistência para atualizar sua integração:

- **Referência da API**: Consulte a [Referência da API](../api-reference/overview.md) para obter documentação atual dos endpoints
- **APIs Externas**: Veja [APIs Externas](../api-reference/external-apis.md) para obter documentação detalhada dos endpoints
- **Guia de Migração**: Revise o [Guia de Migração](version_upgrade.md) para obter informações gerais sobre migração
- **Notas de Lançamento**: Revise as [Notas de Lançamento](../release-notes/0.8.x.md) específicas da versão para obter mais contexto
- **Suporte**: Abra uma issue no [GitHub](https://github.com/wsj-br/duplistatus/issues) para obter suporte

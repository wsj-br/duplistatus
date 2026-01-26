# Mudanças Quebradas da API

Este documento descreve mudanças quebradas em endpoints de API externa em diferentes versões de duplistatus. Endpoints de API externa são aqueles projetados para uso por outras aplicações e Integrações (por exemplo, integração de Homepage).

## visão geral

Este documento aborda mudanças quebradas em endpoints de API externa que afetam Integrações, scripts e aplicações que consomem esses endpoints. Para endpoints de API interna usados pela interface web, as mudanças são tratadas automaticamente e não requerem atualizações manuais.

:::note
Endpoints de API externa são mantidos para compatibilidade com versões anteriores Quando possível. Mudanças quebradas são introduzidas apenas Quando necessário para melhorias de consistência, Segurança ou funcionalidade.
:::

## Mudanças Específicas de Versão

### Versão 1.3.0

**Não há mudanças quebradas em endpoints de API externa**

### Versão 1.2.1

**Não há mudanças quebradas em endpoints de API externa**

### Versão 1.1.x

**Não há mudanças quebradas em endpoints de API externa**

### Versão 1.0.x

**Não há mudanças quebradas em endpoints de API externa**

### Versão 0.9.x

**Não há mudanças quebradas em endpoints de API externa**

Versão 0.9.x introduz autenticação e requer que todos os Usuários façam Entrar. Quando atualizar de Versão 0.8.x:

1. **Autenticação Obrigatória**: Todas as Páginas e endpoints de API interna agora requerem autenticação
2. **Conta Admin Padrão**: Uma conta Admin Padrão é Criada automaticamente:
   - Nome de usuário: `admin`
   - Senha: `Duplistatus09` (deve ser alterada no primeiro Login)
3. **Invalidação de Sessão**: Todas as sessões existentes são invalidadas
4. **Acesso à API Externa**: Endpoints de API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecem não autenticados para compatibilidade com Integrações e Duplicati

### Versão 0.8.x

**Não há mudanças quebradas em endpoints de API externa**

Versão 0.8.x não introduz nenhuma mudança quebrada em endpoints de API externa. Os seguintes endpoints permanecem inalterados:

- `/api/summary` - Estrutura de resposta inalterada
- `/api/lastbackup/{serverId}` - Estrutura de resposta inalterada
- `/api/lastbackups/{serverId}` - Estrutura de resposta inalterada
- `/api/upload` - Formato de solicitação/resposta inalterado

#### Melhorias de Segurança

Embora nenhuma mudança quebrada tenha sido feita em endpoints de API externa, Versão 0.8.x inclui melhorias de Segurança:

- **Proteção CSRF**: A validação de token CSRF é aplicada para solicitações de API que alteram estado, mas APIs externas permanecem compatíveis
- **Segurança de Senha**: Endpoints de Senha são restritos à interface do Usuário por razões de Segurança

:::note
Essas melhorias de Segurança não afetam endpoints de API externa usados para ler dados de backup. Se você tiver scripts personalizados usando endpoints internos, eles podem exigir tratamento de token CSRF.
:::

### Versão 0.7.x

Versão 0.7.x introduz várias mudanças quebradas em endpoints de API externa que requerem atualizações em Integrações externas.

#### Mudanças Quebradas

##### Renomeação de Campo

- **`totalMachines`** → **`totalServers`** em endpoint `/api/summary`
- **`machine`** → **`server`** em objetos de resposta de API
- **`backup_types_count`** → **`backup_jobs_count`** em endpoint `/api/lastbackups/{serverId}`

##### Mudanças de Caminho de Endpoint

- Todos os endpoints de API anteriormente usando `/api/machines/...` Agora usam `/api/servers/...`
- Nomes de parâmetros alterados de `machine_id` para `server_id` (a codificação de URL ainda funciona com ambos)

#### Mudanças na Estrutura de Resposta

A estrutura de resposta para vários endpoints foi atualizada para consistência:

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
    "name": "Nome do servidor",
    "backup_name": "Nome do backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Detalhes
  },
  "status": 200
}
```

**Depois (0.7.x+):**

```json
{
  "server": {  // Alterado de "machine"
    "id": "unique-server-id",
    "name": "Nome do servidor",
    "backup_name": "Nome do backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Detalhes
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
    "name": "Nome do servidor",
    "backup_name": "Backup Padrão",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de backup
  ],
  "backup_types_count": 2,  // Alterado para "backup_jobs_count"
  "backup_names": ["Arquivos", "Databases"],
  "status": 200
}
```

**Depois (0.7.x+):**

```json
{
  "server": {  // Alterado de "machine"
    "id": "unique-server-id",
    "name": "Nome do servidor",
    "backup_name": "Backup Padrão",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de backup
  ],
  "backup_jobs_count": 2,  // Alterado de "backup_types_count"
  "backup_names": ["Arquivos", "Databases"],
  "status": 200
}
```

## Etapas de Migração

Se você está atualizando de uma Versão anterior a 0.7.x, siga estas etapas:

1. **Atualizar Referências de Campo**: Substitua Todos as referências aos nomes de campo antigos pelos novos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Atualizar Chaves de Objeto**: Altere `machine` para `server` na análise de resposta
   - Atualize qualquer código que acesse `response.machine` para `response.server`

3. **Atualizar Caminhos de Endpoint**: Altere qualquer endpoint usando `/api/machines/...` para `/api/Servidores/...`
   - Nota: Os parâmetros ainda podem aceitar identificadores antigos; os caminhos devem ser atualizados

4. **Integração de Teste**: Verificar que sua Integração funciona com a nova estrutura de API
   - Testar Todos os endpoints que sua aplicação usa
   - Verificar que a análise de resposta trata corretamente os novos nomes de campo

5. **Atualizar Documentação**: Atualize qualquer documentação interna referenciando a API antiga
   - Atualize exemplos de API e referências de nomes de campo

## Compatibilidade

### Compatibilidade com Versões Anteriores

- **Versão 1.2.1**: Totalmente compatível com versões anteriores com estrutura de API 1.1.x
- **Versão 1.1.x**: Totalmente compatível com versões anteriores com estrutura de API 1.0.x
- **Versão 1.0.x**: Totalmente compatível com versões anteriores com estrutura de API 0.9.x
- **Versão 0.9.x**: Totalmente compatível com versões anteriores com estrutura de API 0.8.x
- **Versão 0.8.x**: Totalmente compatível com versões anteriores com estrutura de API 0.7.x
- **Versão 0.7.x**: Não compatível com versões anteriores com versões anteriores a 0.7.x
  - Os nomes de campo antigos não funcionarão
  - Os caminhos de endpoint antigos não funcionarão

### Suporte Futuro

- Nomes de campo antigos de versões anteriores a 0.7.x não são Não suportado
- Caminhos de endpoint antigos de versões anteriores a 0.7.x não são Não suportado
- Versões futuras manterão a estrutura de API Atual a menos que mudanças quebradas sejam necessárias

## Resumo de Endpoints de API Externa

Os seguintes endpoints de API externa são mantidos para compatibilidade com versões anteriores e permanecem não autenticados:

| Endpoint                      | Método | Descrição                             | Mudanças Quebradas                                                                                                      |
| ----------------------------- | ------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/api/summary`                | GET    | Resumo geral de operações de backup   | 0.7.x: `totalMachines` → `totalServers`                                 |
| `/api/lastbackup/{serverId}`  | GET    | Último backup para um Servidores      | 0.7.x: `machine` → `server`                                             |
| `/api/lastbackups/{serverId}` | GET    | Últimos backups para Todos os backups | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload`                 | POST   | Subir dados de backup de Duplicati    | Sem mudanças quebradas                                                                                                  |

## Precisa de Ajuda? {#need-help}

Se você precisar de assistência para atualizar sua Integração:

- **Referência de API**: Verificar a [Referência de API](../api-reference/overview.md) para documentação de endpoint Atual
- **APIs Externas**: Consulte [APIs Externas](../api-reference/external-apis.md) para documentação detalhada de endpoint
- **Guia de Migração**: Revise o [Guia de Migração](version_upgrade.md) para informações de migração Geral
- **Notas de Lançamento**: Revise as [Notas de Lançamento](../release-notes/0.8.x.md) específicas de Versão para contexto adicional
- **Suporte**: Abra um problema em [GitHub](https://github.com/wsj-br/duplistatus/issues) para suporte

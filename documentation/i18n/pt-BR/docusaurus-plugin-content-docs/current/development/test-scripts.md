---
translation_last_updated: '2026-04-18T14:28:17.067Z'
source_file_mtime: '2026-04-18T14:26:03.387Z'
source_file_hash: 1d2e30215eab8e6548c552a40d5a81eb9837ec96e1f22b22b2e39a0a757fe50a
translation_language: pt-BR
source_file_path: documentation/docs/development/test-scripts.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Scripts de Teste {#test-scripts}

O projeto inclui vários scripts de teste para ajudar no desenvolvimento e testes:

> [!NOTE]
> Legados auxiliares de raiz do repositório `pnpm` para depuração de backups atrasados, testes de matriz SMTP e verificações de porta do cron foram removidos. Use a interface do aplicativo (**Configurações → Monitoramento de Backup**), APIs HTTP autenticadas e `curl` contra o serviço cron conforme documentado abaixo.

## Gerar Dados de Testar {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Este script gera dados de backup de teste para múltiplos servidores e backups.

O parâmetro `--servers=N` é **obrigatório** e especifica o número de servidores a gerar (1-30).

Use a opção `--upload` para enviar os dados gerados para `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Exemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Este script deleta todos os dados anteriores no banco de dados e os substitui por dados de teste.
> Faça backup do seu banco de dados antes de executar este script.

## Verificações de atraso e conectividade do cron (desenvolvimento) {#overdue-checks-and-cron-connectivity-development}

### Executar uma verificação de backup atrasado {#run-an-overdue-backup-check}

Enquanto o aplicativo estiver em execução:

- **Interface do usuário (recomendado):** abra **Configurações → Monitoramento de Backup** e use **Testar backups atrasados**. Isso executa a mesma lógica do trabalho agendado por meio de `POST /api/notifications/check-overdue` autenticado.

### Saúde do serviço Cron {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulando uma data ou hora específica {#simulating-a-specific-date-or-time}

Não há uma CLI integrada para injetar um tempo simulado "atual". Para o algoritmo e ideias de teste manual, consulte o arquivo do repositório `dev/OVERDUE_DETECTION_ALGORITHM.md` e a implementação em `src/lib/overdue-backup-checker.ts`.

## Validar exportação CSV {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Este script valida a funcionalidade de exportação CSV. Ele:
- Testa a geração de exportação CSV
- Verifica o formato e a estrutura dos dados
- Verifica a integridade dos dados nos arquivos exportados

Útil para garantir que as exportações de CSV funcionem corretamente antes dos lançamentos.

## Bloquear temporariamente o servidor NTFY (para testes) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloqueia temporariamente o acesso de rede de saída para o Servidor NTFY (`ntfy.sh`) para testar o mecanismo de tentar novamente de notificações. Ele:
- Resolve o Endereço IP do Servidor NTFY
- Adiciona uma regra de iptables para bloquear o tráfego de saída
- Bloqueia por 10 segundos (configurável)
- Remove automaticamente a regra de bloqueio ao sair
- Requer privilégios de root (sudo)

>[!CAUTION]
> Este script modifica regras de iptables e requer privilégios de root. Use apenas para testar mecanismos de tentar novamente de notificações.

## Testes de Migração de Banco de Dados {#database-migration-testing}

O projeto inclui scripts para testar migrações de banco de dados de versões antigas para a versão atual. Esses scripts garantem que as migrações de banco de dados funcionem corretamente e preservem a integridade dos dados.

### Gerar Dados de Teste de Migração {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

Este script gera bancos de dados de teste para múltiplas versões históricas da aplicação. Ele:

1. **Para e remove** qualquer container Docker existente
2. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Remove arquivos de banco de dados existentes
   - Cria um arquivo de tag de versão
   - Inicia um container Docker com a versão específica
   - Aguarda o container estar pronto
   - Gera dados de teste usando `pnpm generate-test-data`
   - Tira uma captura de tela da UI com dados de teste
   - Para e remove o container
   - Libera arquivos WAL e salva o esquema do banco de dados
   - Copia o arquivo de banco de dados para `scripts/migration_test_data/`

**Requisitos:**
- Docker deve estar instalado e configurado
- Google Chrome (via Puppeteer) deve estar instalado
- Acesso root/sudo para operações do Docker
- O volume do Docker `duplistatus_data` deve existir

**Saída:**
- Arquivos de banco de dados: `scripts/migration_test_data/backups_<VERSION>.db`
- Arquivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de tela: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuração:**
- Número de servidores: Definido via variável `SERVERS` (padrão: 3)
- Diretório de dados: `/var/lib/docker/volumes/duplistatus_data/_data`
- Porta: 9666 (porta do contêiner Docker)

>[!CAUTION]
> Este script requer Docker e irá parar/remover contêineres existentes. Também requer acesso sudo para operações do Docker e acesso ao sistema de arquivos. É necessário executar o script `pnpm take-screenshots` primeiro para instalar o Google Chrome, caso ainda não tenha feito.

>[!IMPORTANT]
> Este script deveria ser executado apenas uma vez. Nas novas versões, o desenvolvedor pode copiar o arquivo de banco de dados e as capturas de tela diretamente para o diretório `scripts/migration_test_data/`. Durante o desenvolvimento, basta executar o script `./scripts/test-migrations.sh` para testar as migrações.

### Migrações de Banco de Dados de Teste {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Este script testa migrações de banco de dados de versões antigas para a versão atual (4.0). Ele:

1. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Cria uma cópia temporária de banco de dados de teste
   - Executa o processo de migração usando `test-migration.ts`
   - Valida a estrutura do banco de dados migrado
   - Verifica tabelas e colunas obrigatórias
   - Verifica se a versão do banco de dados é 4.0
   - Limpa arquivos temporários

**Requisitos:**
- Os bancos de dados de teste devem existir em `scripts/migration_test_data/`
- Gerados executando `generate-migration-test-data.sh` primeiro

**Saída:**
- Resultados de testes com código de cores (verde para aprovado, vermelho para falha)
- Resumo de versões aprovadas e com falha
- Mensagens de erro detalhadas para migrações com falha
- Código de saída 0 se todos os testes forem aprovados, 1 se algum falhar

**O que valida:**
- A versão do banco de dados é 4.0 após a migração
- Todas as tabelas obrigatórias existem: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- As colunas obrigatórias existem em cada tabela
- A estrutura do banco de dados está correta

**Saída de exemplo:**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Uso:**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Este script usa internamente o script de teste de migração TypeScript (`test-migration.ts`). O script de teste valida a estrutura do banco de dados após a migração e garante a integridade dos dados.

## SMTP e e-mail (desenvolvimento) {#smtp-and-email-development}

Configure o SMTP em **Configurações → E-mail** e use os fluxos internos de teste de e-mail e notificações. Os antigos scripts auxiliares `pnpm set-smtp-test-config` e `pnpm test-smtp-connections` foram removidos do repositório.

## Testar Script de Entrypoint Docker {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Este script fornece um wrapper de teste para `docker-entrypoint.sh` no desenvolvimento local. Ele configura o ambiente para testar a funcionalidade de logging do entrypoint e garante que os logs sejam gravados em `data/logs/` para que a aplicação possa acessá-los.

**O que faz:**

1. **Sempre constrói uma versão atualizada**: Executa automaticamente `pnpm build-local` para criar uma compilação atualizada antes dos testes (sem necessidade de compilar manualmente primeiro)
2. **Constrói o serviço cron**: Garante que o serviço cron seja compilado (`dist/cron-service.cjs`)
3. **Configura estrutura semelhante ao Docker**: Cria symlinks e estrutura de diretórios necessários para simular o ambiente Docker
4. **Executa script de ponto de entrada**: Executa `docker-entrypoint.sh` com variáveis de ambiente apropriadas
5. **Limpa**: Remove automaticamente arquivos temporários ao sair

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variáveis de Ambiente:**
- `PORT=8666` - Porta para o servidor Next.js (corresponde a `start-local`)
- `CRON_PORT=8667` - Porta para o serviço cron
- `VERSION` - Definida automaticamente no formato `test-YYYYMMDD-HHMMSS`

**Saída:**
- Os logs são escritos em `data/logs/application.log` (acessível pela aplicação)
- A saída do console mostra a execução do script de ponto de entrada
- Pressione Ctrl+C para parar e testar o despejo de logs

**Requisitos:**
- O script deve ser executado a partir do diretório raiz do repositório (pnpm faz isso automaticamente)
- O script trata automaticamente todos os pré-requisitos (build, serviço cron, etc.)

**Casos de Uso:**
- Testar alterações de script de entrypoint localmente antes da implantação Docker
- Verificar rotação de logs e funcionalidade de logging
- Testar encerramento gracioso e tratamento de sinais
- Depurar o comportamento do script de entrypoint em um ambiente local

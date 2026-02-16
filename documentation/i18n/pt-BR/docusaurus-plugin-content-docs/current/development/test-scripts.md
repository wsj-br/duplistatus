---
translation_last_updated: '2026-02-16T00:13:40.635Z'
source_file_mtime: '2026-02-01T03:16:19.469Z'
source_file_hash: 6f3df4c1ef3576bd
translation_language: pt-BR
source_file_path: development/test-scripts.md
---
# Scripts de Teste {#test-scripts}

O projeto inclui vários scripts de teste para ajudar no desenvolvimento e testes:

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

## Mostrar o conteúdo das notificações atrasadas (para depurar o sistema de notificações) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Executar verificação de atrasado em uma data/hora específica (para depurar o sistema de notificação) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Testar conectividade da porta do serviço cron {#test-cron-service-port-connectivity}

Para testar a conectividade do serviço cron, você pode:

1. Verificar se o serviço cron está em execução:

```bash
curl http://localhost:8667/health
```

2. Ou use os endpoints da API do serviço cron diretamente através da aplicação principal:

```bash
curl http://localhost:8666/api/cron/health
```

3. Use o script de teste para verificar a conectividade da porta:

```bash
pnpm test-cron-port
```

Este script testa a conectividade com a porta do serviço cron e fornece informações detalhadas sobre o status da conexão.

## Testar detecção de atrasado {#test-overdue-detection}

```bash
pnpm test-overdue-detection
```

Este script testa a lógica de detecção de backup atrasado. Ele verifica:
- Identificação de backup atrasado
- Acionamento de notificações
- Cálculos de data/hora para status de atraso

Útil para depuração de sistemas de detecção e notificação de backup atrasado.

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

## Configurar Teste de SMTP {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

Este script define a configuração de teste SMTP a partir de variáveis de ambiente. Ele aceita um parâmetro `connectionType` (`plain`, `starttls` ou `ssl`) e lê variáveis de ambiente correspondentes com prefixos (`PLAIN_`, `STARTTLS_`, `SSL_`) para atualizar a configuração SMTP no banco de dados.

Para conexões simples, o script lê a variável de ambiente `PLAIN_SMTP_FROM` para definir o Endereço do remetente obrigatório. Isso facilita o teste de diferentes tipos de conexão SMTP sem atualizações manuais do banco de dados.

**Uso:**

```bash
# Set Plain SMTP configuration
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Set STARTTLS configuration
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Set Direct SSL/TLS configuration
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Requisitos:**
- A aplicação deve estar em execução
- As variáveis de ambiente devem ser definidas com o prefixo apropriado para o tipo de conexão
- Para conexões simples, `PLAIN_SMTP_FROM` é obrigatório

## Testar Tipo de conexão SMTP Cross-Compatibility {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

Este script realiza um teste abrangente de matriz 3x3 que valida se as configurações destinadas a um tipo de conexão funcionam corretamente com diferentes tipos de conexão. Para cada tipo de configuração base (plain, starttls, ssl), o script:

1. Lê variáveis de ambiente com prefixos correspondentes (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Testa todos os três tipos de conexão modificando apenas o campo `connectionType`
3. Envia emails de teste via API
4. Registra resultados em formato de matriz
5. Exibe uma tabela de resumo
6. Salva resultados detalhados em `smtp-test-results.json`

**Uso:**

```bash
# Set environment variables for all three connection types
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm test-smtp-connections
```

**Requisitos:**
- A aplicação deve estar em execução
- Variáveis de ambiente devem ser definidas para todos os três tipos de conexão
- O script valida a configuração sendo usada através de registros detalhados

**Comportamento Esperado:**
As configurações devem funcionar apenas com seu tipo de conexão pretendido (por exemplo, configuração simples funciona com connectionType simples, mas falha com STARTTLS/ssl).

**Saída:**
- Saída do console com uma tabela de resumo mostrando resultados dos testes
- Arquivo `smtp-test-results.json` com resultados detalhados dos testes para cada combinação de configuração e tipo de conexão

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

# Scripts de Teste {/* #test-scripts */}

O projeto inclui vários scripts de teste para ajudar no desenvolvimento e testes:

> [!NOTE]
> Os auxiliares `pnpm` da raiz do repositório legado para depuração de atrasos, teste de matriz SMTP e verificação de porta cron foram removidos. Use a interface do aplicativo (**Configurações → Monitoramento de Backup**), APIs HTTP autenticadas e `curl` contra o serviço cron conforme documentado abaixo.

## Gerar Dados de Teste {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Este script gera dados de backup de teste para vários servidores e backups.

O parâmetro `--servers=N` é **obrigatório** e especifica o número de servidores a serem gerados (1-30).

Use a opção `--upload` para enviar os dados gerados para o `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` é obrigatório quando Configurações → Chaves de API está configurado para exigir chaves. O script tenta novamente uma vez em HTTP 429 para que uma execução grande do `--upload` fique dentro dos limites de taxa padrão.

**Exemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

O script atribui versões do Duplicati **por servidor** (a mesma string de relatório é escrita em todos os backups para esse servidor):

- **70–80% atual**: usa a versão estável mais recente em cache disponível em `configurations.duplicati_versions`, caso contrário, uma versão de fallback fixada (`2.1.0.5_stable`).
- **Restante mais antiga**: uma versão estável anterior para que o distintivo do painel seja comparado como desatualizado (amarelo).
- O modo Direct-DB apaga `configurations` primeiro, em seguida, restaura ou semente o cache de versão para que a comparação atual/desatualizada funcione imediatamente.
- Pequenas quantidades não sempre caem em 70–80%: `--servers=1` é 100% atual; `--servers=2` ou `3` mantém pelo menos um servidor mais antigo; `--servers=6` é 5 atual (83%). `--servers=12` (usado por `pnpm take-screenshots`) é **9 atual / 3 mais antiga**.
- Quando `pnpm take-screenshots` reduz posteriormente o conjunto de dados para três servidores, ele mantém o servidor atrasado protegido e **pelo menos um servidor de versão mais antiga**.

>[!CAUTION]
> Este script exclui todos os dados anteriores no banco de dados e os substitui por dados de teste.
> Faça backup do seu banco de dados antes de executar este script.

## Verificações de atraso e conectividade do cron (desenvolvimento) {/* #overdue-checks-and-cron-connectivity-development */}

### Executar uma verificação de backup atrasado {/* #run-an-overdue-backup-check */}

Enquanto o aplicativo está em execução:

- **UI (recomendado):** abra **Configurações → Monitoramento de Backup** e use **Testar backups atrasados**. Isso executa a mesma lógica que o trabalho agendado via `POST /api/notifications/check-overdue` autenticado.

### Saúde do serviço cron {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulando uma data ou hora específica {/* #simulating-a-specific-date-or-time */}

Não há CLI embutido para injetar um tempo “atual” simulado. Para o algoritmo e ideias de teste manual, consulte o arquivo do repositório `dev/OVERDUE_DETECTION_ALGORITHM.md` e a implementação em `src/lib/overdue-backup-checker.ts`.

## Validar exportação CSV {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Este script valida a funcionalidade de exportação CSV. Ele:
- Testa a geração de exportação CSV
- Verifica o formato e a estrutura dos dados
- Verifica a integridade dos dados nos arquivos exportados

Útil para garantir que as exportações CSV funcionem corretamente antes dos lançamentos.

## Bloquear temporariamente o servidor NTFY (para teste) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloqueia temporariamente o acesso de rede de saída para o servidor NTFY (`ntfy.sh`) para testar o mecanismo de retentativa de notificação. Ele:
- Resolve o endereço IP do servidor NTFY
- Adiciona uma regra iptables para bloquear o tráfego de saída
- Bloqueia por 10 segundos (configurável)
- Remove automaticamente a regra de bloqueio ao sair
- Requer privilégios de root (sudo)

>[!CAUTION]
> Este script modifica as regras iptables e requer privilégios de root. Use apenas para testar mecanismos de retentativa de notificação.

## Testes de Migração de Banco de Dados {/* #database-migration-testing */}

O projeto inclui scripts para testar migrações de banco de dados de versões anteriores para a versão atual. Esses scripts garantem que as migrações de banco de dados funcionem corretamente e preservem a integridade dos dados.

### Gerar Dados de Teste de Migração {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Este script gera bancos de dados de teste para várias versões históricas da aplicação. Ele:

1. **Para** qualquer contêiner Docker existente
2. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Remove os arquivos de banco de dados existentes
   - Cria um arquivo de tag de versão
   - Inicia um contêiner Docker com a versão específica
   - Aguarda o contêiner estar pronto
   - Gera dados de teste usando `pnpm generate-test-data`
   - Captura uma captura de tela da interface com os dados de teste
   - Para e remove o contêiner
   - Limpa os arquivos WAL e salva o esquema do banco de dados
   - Copia o arquivo do banco de dados para `scripts/migration_test_data/`

**Requisitos:**
- Docker deve estar instalado e configurado
- Chromium (via Playwright) deve estar instalado
- Acesso root/sudo para operações Docker
- O volume Docker `duplistatus_data` deve existir

**Saída:**
- Arquivos de banco de dados: `scripts/migration_test_data/backups_<VERSION>.db`
- Arquivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de tela: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuração:**
- Número de servidores: Definido via variável `SERVERS` (padrão: 3)
- Diretório de dados: `/var/lib/docker/volumes/duplistatus_data/_data`
- Porta: 9666 (porta do contêiner Docker)

>[!CAUTION]
> Este script requer Docker e irá parar/remover contêineres existentes. Ele também requer acesso sudo para operações Docker e acesso ao sistema de arquivos. Execute `pnpm take-screenshots:install` primeiro para instalar o navegador Chromium do Playwright, se ainda não o tiver feito.

>[!IMPORTANT]
> Este script estava suposto a ser executado apenas uma vez, pois novas versões o desenvolvedor pode copiar o arquivo do banco de dados e as capturas de tela diretamente para o diretório `scripts/migration_test_data/`. Durante o desenvolvimento, basta executar o script `./scripts/test-migrations.sh` para testar as migrações.

### Testar Migrações de Banco de Dados {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Este script testa as migrações de banco de dados de versões antigas para a versão atual (4.0). Ele:

1. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Cria uma cópia temporária do banco de dados de teste
   - Executa o processo de migração usando `test-migration.ts`
   - Valida a estrutura do banco de dados migrado
   - Verifica as tabelas e colunas necessárias
   - Confirma que a versão do banco de dados é 4.0
   - Limpa os arquivos temporários

**Requisitos:**
- Bancos de dados de teste devem existir em `scripts/migration_test_data/`
- Gerados executando `generate-migration-test-data.sh` primeiro

**Saída:**
- Resultados de teste coloridos (verde para passar, vermelho para falhar)
- Resumo das versões que passaram e falharam
- Mensagens de erro detalhadas para migrações falhadas
- Código de saída 0 se todos os testes passarem, 1 se algum falhar

**O que ele valida:**
- A versão do banco de dados é 4.0 após a migração
- Todas as tabelas necessárias existem: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- As colunas necessárias existem em cada tabela
- A estrutura do banco de dados está correta

**Exemplo de saída:**

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
> Este script usa o script de teste de migração em TypeScript (`test-migration.ts`) internamente. O script de teste valida a estrutura do banco de dados após a migração e garante a integridade dos dados.

## SMTP e e-mail (desenvolvimento) {/* #smtp-and-email-development */}

Configure o SMTP em **Configurações → E-mail** e use os fluxos de teste e notificação de e-mail no aplicativo. Os scripts auxiliares `pnpm set-smtp-test-config` e `pnpm test-smtp-connections` foram removidos do repositório.

## Testar Script de Entrypoint do Docker {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Este script fornece um wrapper de teste para `docker-entrypoint.sh` no desenvolvimento local. Ele configura o ambiente para testar a funcionalidade de logging do entrypoint e garante que os logs sejam escritos em `data/logs/` para que o aplicativo possa acessá-los.

**O que ele faz:**

1. **Sempre constrói uma versão nova**: Executa automaticamente `pnpm build-local` para criar uma nova compilação antes de testar (não é necessário compilar manualmente primeiro)
2. **Constrói o serviço cron**: Garante que o serviço cron seja construído (`dist/cron-service.cjs`)
3. **Configura a estrutura Docker-like**: Cria os links simbólicos e a estrutura de diretórios necessários para simular o ambiente Docker
4. **Executa o script de entrypoint**: Executa `docker-entrypoint.sh` com as variáveis de ambiente adequadas
5. **Limpa**: Remove automaticamente os arquivos temporários ao sair

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variáveis de Ambiente:**
- `PORT=8666` - Porta para o servidor Next.js (corresponde a `start-local`)
- `CRON_PORT=8667` - Porta para o serviço cron
- `VERSION` - Definido automaticamente no formato `test-YYYYMMDD-HHMMSS`

**Saída:**
- Os logs são gravados em `data/logs/application.log` (acessíveis pela aplicação)
- A saída do console mostra a execução do script de entrada
- Pressione Ctrl+C para parar e testar o descarregamento de logs

**Requisitos:**
- O script deve ser executado a partir do diretório raiz do repositório (pnpm lida com isso automaticamente)
- O script lida automaticamente com todos os pré-requisitos (build, serviço cron, etc.)

**Casos de Uso:**
- Testar alterações no script de entrada localmente antes do deployment no Docker
- Verificar a rotação de logs e a funcionalidade de logging
- Testar o encerramento gracioso e o tratamento de sinais
- Depurar o comportamento do script de entrada em um ambiente local

## Validação do Resumo Diário {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Executa verificações determinísticas para agendamento do Resumo Diário (incluindo horário de verão), agregação de snapshots (apenas os últimos trabalhos de backup), limpeza de configurações de notificação, linhas de backup/servidor órfãs, sanitização de Markdown, reivindicações do registro de entrega e migração do esquema 4.1 → 4.2 com modelos personalizados. Não envia e-mail ou NTFY.

# Scripts de Teste {/* #test-scripts */}

O projeto inclui vários scripts de teste para ajudar no desenvolvimento e testes:

> [!NOTE]
> Auxiliares legados no raiz do repositório `pnpm` para depuração de atrasos, testes de matriz SMTP e verificações de porta cron foram removidos. Use a interface do aplicativo (**Configurações → Monitoramento de Backup**), APIs HTTP autenticadas e `curl` contra o serviço cron conforme documentado abaixo.

## Gerar Dados de Teste {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Este script gera dados de backup de teste para múltiplos servidores e backups.

O parâmetro `--servers=N` é **obrigatório** e especifica o número de servidores a gerar (1-30).

Use a opção `--upload` para enviar os dados gerados para `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` é obrigatório quando Configurações → Chaves de API está configurado para exigir chaves. O script tenta novamente uma vez em HTTP 429 para que uma execução grande de `--upload` permaneça dentro dos limites de taxa padrão.

**Exemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

O script atribui versões do Duplicati **por servidor** (a mesma string de relatório é escrita para cada backup desse servidor):

- **70–80% atual**: usa a versão estável em cache mais recente de `configurations.duplicati_versions` quando disponível, caso contrário um fallback fixo (`2.1.0.5_stable`).
- **Restante mais antigo**: uma versão estável estritamente anterior para que o badge do painel se compare como desatualizado (amarelo).
- O modo Direct-DB limpa `configurations` primeiro, depois restaura ou semeia o cache de versão para que a comparação atual/desatualizado funcione imediatamente.
- Contagens pequenas nem sempre conseguem chegar a 70–80%: `--servers=1` é 100% atual; `--servers=2` ou `3` mantém pelo menos um servidor mais antigo; `--servers=6` é 5 atual (83%). `--servers=12` (usado por `pnpm take-screenshots`) é **9 atual / 3 mais antigo**.
- Quando `pnpm take-screenshots` reduz posteriormente o conjunto de dados para três servidores, mantém o servidor atrasado protegido e **pelo menos um servidor com versão mais antiga**.

>[!CAUTION]
> Este script deleta todos os dados anteriores no banco de dados e os substitui por dados de teste.
> Faça backup do seu banco de dados antes de executar este script.

## Verificações de atraso e conectividade cron (desenvolvimento) {/* #overdue-checks-and-cron-connectivity-development */}

### Executar uma verificação de backup atrasado {/* #run-an-overdue-backup-check */}

Enquanto o aplicativo está em execução:

- **Interface (recomendado):** abra **Configurações → Monitoramento de Backup** e use **Testar backups atrasados**. Isso executa a mesma lógica que o trabalho agendado via `POST /api/notifications/check-overdue` autenticado.

### Saúde do serviço Cron {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulando uma data ou hora específica {/* #simulating-a-specific-date-or-time */}

Não há CLI agrupado para injetar um tempo "atual" simulado. Para o algoritmo e ideias de teste manual, consulte o arquivo do repositório `dev/OVERDUE_DETECTION_ALGORITHM.md` e a implementação em `src/lib/overdue-backup-checker.ts`.

## Validar exportação CSV {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Este script valida a funcionalidade de exportação CSV. Ele:
- Testa a geração de exportação CSV
- Verifica o formato e a estrutura dos dados
- Verifica a integridade dos dados nos arquivos exportados

Útil para garantir que as exportações CSV funcionem corretamente antes dos lançamentos.

## Bloquear temporariamente o servidor NTFY (para testes) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloqueia temporariamente o acesso de rede de saída para o Servidor NTFY (`ntfy.sh`) para testar o mecanismo de repetição de notificações. Ele:
- Resolve o Endereço IP do Servidor NTFY
- Adiciona uma regra de iptables para bloquear o tráfego de saída
- Bloqueia por 10 segundos (configurável)
- Remove automaticamente a regra de bloqueio ao sair
- Requer privilégios de root (sudo)

>[!CAUTION]
> Este script modifica regras iptables e requer privilégios de root. Use apenas para testar mecanismos de repetição de notificações.

## Testes de Migração de Banco de Dados {/* #database-migration-testing */}

O projeto inclui scripts para testar migrações de banco de dados de versões antigas para a versão atual. Esses scripts garantem que as migrações de banco de dados funcionem corretamente e preservem a integridade dos dados.

### Gerar Dados de Teste de Migração {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Este script gera bancos de dados de teste para múltiplas versões históricas da aplicação. Ele:

1. **Interrompe e remove** qualquer contêiner Docker existente
2. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Remove arquivos de banco de dados existentes
   - Cria um arquivo de etiqueta de versão
   - Inicia um contêiner Docker com a versão específica
   - Aguarda o contêiner estar pronto
   - Gera dados de teste usando `pnpm generate-test-data`
   - Faz uma captura de tela da interface com os dados de teste
   - Interrompe e remove o contêiner
   - Descarrega arquivos WAL e salva o esquema do banco de dados
   - Copia o arquivo do banco de dados para `scripts/migration_test_data/`

**Requisitos:**
- Docker deve estar instalado e configurado
- Chromium (via Playwright) deve estar instalado
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
> Este script requer Docker e irá parar/remover contêineres existentes. Também requer acesso sudo para operações do Docker e acesso ao sistema de arquivos. Execute `pnpm take-screenshots:install` primeiro para instalar o navegador Chromium do Playwright se você ainda não o fez.

>[!IMPORTANT]
> Este script deveria ser executado apenas uma vez, pois para novas versões o desenvolvedor pode copiar o arquivo de banco de dados e as capturas de tela diretamente para o diretório `scripts/migration_test_data/`. Durante o desenvolvimento, apenas execute o script `./scripts/test-migrations.sh` para testar as migrações.

### Testar Migrações de Banco de Dados {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Este script testa migrações de banco de dados de versões antigas para a versão atual (4.0). Ele:

1. **Para cada versão** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Cria uma cópia temporária do banco de dados de teste
   - Executa o processo de migração usando `test-migration.ts`
   - Valida a estrutura do banco de dados migrado
   - Verifica se as tabelas e colunas necessárias estão presentes
   - Confirma que a versão do banco de dados é 4.0
   - Limpa arquivos temporários

**Requisitos:**
- Os bancos de dados de teste devem existir em `scripts/migration_test_data/`
- Gerados executando `generate-migration-test-data.sh` primeiro

**Saída:**
- Resultados de teste com código de cores (verde para sucesso, vermelho para falha)
- Resumo de versões bem-sucedidas e com falha
- Mensagens de erro detalhadas para migrações com falha
- Código de saída 0 se todos os testes passarem, 1 se algum falhar

**O que valida:**
- A versão do banco de dados é 4.0 após a migração
- Todas as tabelas obrigatórias existem: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- As colunas obrigatórias existem em cada tabela
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
> Este script usa o script de teste de migração TypeScript (`test-migration.ts`) internamente. O script de teste valida a estrutura do banco de dados após a migração e garante a integridade dos dados.

## SMTP e e-mail (desenvolvimento) {/* #smtp-and-email-development */}

Configure SMTP em **Configurações → E-mail** e use o teste de e-mail no aplicativo e fluxos de notificação. Os scripts auxiliares anteriores `pnpm set-smtp-test-config` e `pnpm test-smtp-connections` foram removidos do repositório.

## Testar Script de Ponto de Entrada Docker {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Este script fornece um wrapper de teste para `docker-entrypoint.sh` no desenvolvimento local. Ele configura o ambiente para testar a funcionalidade de registro do ponto de entrada e garante que os logs sejam gravados em `data/logs/` para que o aplicativo possa acessá-los.

**O que faz:**

1. **Sempre cria uma versão nova**: Executa automaticamente `pnpm build-local` para criar uma compilação nova antes de testar (sem necessidade de compilar manualmente primeiro)
2. **Compila o serviço cron**: Garante que o serviço cron seja compilado (`dist/cron-service.cjs`)
3. **Configura estrutura semelhante ao Docker**: Cria symlinks e estrutura de diretório necessários para imitar o ambiente Docker
4. **Executa script de ponto de entrada**: Executa `docker-entrypoint.sh` com variáveis de ambiente apropriadas
5. **Remove temporários**: Remove automaticamente arquivos temporários ao sair

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variáveis de Ambiente:**
- `PORT=8666` - Porta para o servidor Next.js (corresponde a `start-local`)
- `CRON_PORT=8667` - Porta para o serviço cron
- `VERSION` - Definido automaticamente para o formato `test-YYYYMMDD-HHMMSS`

**Saída:**
- Os logs são gravados em `data/logs/application.log` (acessível pela aplicação)
- A saída do console mostra a execução do script de ponto de entrada
- Pressione Ctrl+C para parar e testar o despejo de logs

**Requisitos:**
- O script deve ser executado a partir do diretório raiz do repositório (pnpm faz isso automaticamente)
- O script trata automaticamente todos os pré-requisitos (build, serviço cron, etc.)

**Casos de Uso:**
- Testar alterações no script de ponto de entrada localmente antes da implantação Docker
- Verificar a rotação de logs e a funcionalidade de logging
- Testar encerramento gracioso e tratamento de sinais
- Depurar o comportamento do script de ponto de entrada em um ambiente local

## Validação de Resumo Diário {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Executa verificações determinísticas para agendamento de Resumo Diário (incluindo DST), agregação de snapshot (apenas trabalhos de backup mais recentes), limpeza de configurações de notificação restantes, linhas órfãs de backup/servidor, sanitização de Markdown, reivindicações de ledger de entrega e migração de schema 4.1 → 4.2 com modelos personalizados. Não envia e-mail ou NTFY.

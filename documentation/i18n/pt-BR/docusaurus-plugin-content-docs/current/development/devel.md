---
translation_last_updated: '2026-02-05T19:08:55.780Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 4651d154540967f5
translation_language: pt-BR
source_file_path: development/devel.md
---
# Comandos mais utilizados {#most-used-commands}

## Executar em modo de desenvolvimento {#run-in-dev-mode}

```bash
pnpm dev
```

- **Armazenamento de Arquivos JSON**: Todos os dados de backup recebidos são armazenados como arquivos JSON no diretório `data`. Esses arquivos são nomeados usando a data e hora de quando foram recebidos, no formato `YYYY-MM-DDTHH-mm-ss-sssZ.json` (horário UTC). Este recurso está ativo apenas em modo de desenvolvimento e ajuda na depuração ao preservar os dados brutos recebidos do Duplicati.

- **Verbose Logging**: A aplicação registra informações mais detalhadas sobre operações de banco de dados e requisições de API quando executada em modo de desenvolvimento.

- **Atualização de Versão**: O servidor de desenvolvimento atualiza automaticamente as informações de versão antes de iniciar, garantindo que a versão mais recente seja exibida no aplicativo.

- **Exclusão de Backup**: Na página de detalhes do servidor, um botão de exclusão aparece na tabela de backups que permite excluir backups individuais. Este recurso é especialmente útil para testar e depurar a funcionalidade de backups atrasados.

## Iniciar o servidor de produção (em ambiente de desenvolvimento) {#start-the-production-server-in-development-environment}

Primeiro, compile a aplicação para produção local:

```bash
pnpm build-local
```

Em seguida, inicie o servidor de produção:

```bash
pnpm start-local
```

## Iniciar uma pilha Docker (Docker Compose) {#start-a-docker-stack-docker-compose}

```bash
pnpm docker-up
```

Ou manualmente:

```bash
docker compose up --build -d
```

## Parar uma pilha Docker (Docker Compose) {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker-down
```

Ou manualmente:

```bash
docker compose down
```

## Limpar ambiente Docker {#clean-docker-environment}

```bash
pnpm docker-clean
```

Ou manualmente:

```bash
./scripts/clean-docker.sh
```

Este script realiza uma limpeza completa do Docker, que é útil para:
- Liberar espaço em disco
- Remover artefatos antigos/não utilizados do Docker
- Limpar após sessões de desenvolvimento ou testes
- Manter um ambiente Docker limpo

## Criar uma imagem de desenvolvimento (para testar localmente ou com Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```

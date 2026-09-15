# Comandos mais usados {/* #most-used-commands */}

## Executar em modo de desenvolvimento {/* #run-in-dev-mode */}

```bash
pnpm dev
```

Isso inicia tanto o aplicativo Next.js (porta 8666) quanto o serviço cron (porta 8667). CTRL-C interrompe ambos. Use `pnpm dev:next` ou `pnpm cron:dev` para executar cada processo individualmente.

- **Armazenamento de Arquivos JSON**: Todos os dados de backup recebidos são armazenados como arquivos JSON no diretório `data`. Esses arquivos são nomeados usando o timestamp de quando foram recebidos, no formato `YYYY-MM-DDTHH-mm-ss-sssZ.json` (hora UTC). Este recurso está ativo apenas no modo de desenvolvimento e ajuda na depuração, preservando os dados brutos recebidos do Duplicati.

- **Log Detalhado**: O aplicativo registra informações mais detalhadas sobre operações de banco de dados e solicitações de API quando executado no modo de desenvolvimento.

- **Atualização de Versão**: O servidor de desenvolvimento atualiza automaticamente as informações da versão antes de iniciar, garantindo que a versão mais recente seja exibida no aplicativo.

- **Exclusão de Backup**: Na página de detalhes do servidor, um botão de exclusão aparece na tabela de backups, permitindo excluir backups individuais. Este recurso é especialmente útil para testar e depurar a funcionalidade de backups atrasados.

## Iniciar o servidor de produção (em ambiente de desenvolvimento) {/* #start-the-production-server-in-development-environment */}

Primeiro, construa o aplicativo para produção local:

```bash
pnpm build-local
```

Em seguida, inicie o servidor de produção:

```bash
pnpm start-local
```

## Iniciar uma pilha Docker (Docker Compose) {/* #start-a-docker-stack-docker-compose */}

```bash
pnpm docker:up
```

Ou manualmente:

```bash
docker compose up --build -d
```

## Parar uma pilha Docker (Docker Compose) {/* #stop-a-docker-stack-docker-compose */}

```bash
pnpm docker:down
```

Ou manualmente:

```bash
docker compose down
```

## Limpar ambiente Docker {/* #clean-docker-environment */}

```bash
pnpm docker:clean
```

Ou manualmente:

```bash
./scripts/clean-docker.sh
```

Este script realiza uma limpeza completa do Docker, o que é útil para:
- Liberar espaço em disco
- Remover artefatos Docker antigos/não utilizados
- Limpar após sessões de desenvolvimento ou teste
- Manter um ambiente Docker limpo

## Criar uma imagem de desenvolvimento (para testar localmente ou com Podman) {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```

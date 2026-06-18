# Scripts e Comandos do Admin do Workspace {#workspace-admin-scripts-commands}

## Limpar Banco de Dados {#clean-database}

```bash
./scripts/clean-db.sh
```

Limpa o banco de dados removendo todos os dados enquanto preserva o esquema e a estrutura do banco de dados.

>[!CAUTION]
> Use com cuidado, pois isto excluirá todos os dados existentes.

## Limpar artefatos de compilação e dependências {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Remove todos os artefatos de build, o diretório node_modules e outros arquivos gerados para garantir um estado limpo. Isso é útil quando você precisa realizar uma nova instalação ou resolver problemas de dependência. O comando excluirá:
- Diretório `node_modules/`
- Diretório de build `.next/`
- Diretório `dist/`
- Diretório `out/`
- Diretório `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (arquivos de backup JSON de desenvolvimento)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Diretório `.genkit/`
- Arquivos `*.tsbuildinfo`
- Cache do armazenamento pnpm (via `pnpm store prune`)
- Cache de build do Docker e limpeza do sistema (imagens, redes, volumes)

## Limpar Docker Compose e ambiente Docker {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Realiza uma limpeza completa do Docker, o que é útil para:
- Liberar espaço em disco
- Remover artefatos antigos/sem uso do Docker
- Limpar após sessões de desenvolvimento ou testes
- Manter um ambiente Docker limpo

## Atualizar os pacotes para a versão mais recente {#update-the-packages-to-the-latest-version}

Você pode atualizar pacotes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

Ou use o script automatizado (prefira `source` para que **nvm** se aplique ao seu shell atual; para execuções de **CI** ou não interativas, use `CI=1` ou `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

O script `upgrade-dependencies.sh` automatiza todo o processo de atualização de dependências. É agnóstico de projeto: o gerenciador de pacotes, os pacotes do workspace e o comando de verificação de cada pacote são detectados automaticamente (para que os pacotes raiz e `documentation/` sejam atualizados, sem caminhos codificados). Ele:
- Configura ferramentas via `upgrade-tools.sh` (nvm / Node LTS, global `pnpm`, `npm-check-updates`, `doctoc`)
- Realiza atualizações **seguras de build** com modo de verificação `npm-check-updates` para cada pacote: mantém atualizações que passam no `typecheck`/`lint` do pacote e reverte as que quebram o build (com um gate de pares do ESLint embutido para que atualizações do `eslint` e do plugin React permaneçam compatíveis)
- Atualiza o arquivo de bloqueio pnpm do workspace e instala dependências
- Atualiza o banco de dados do browserslist
- Verifica vulnerabilidades (`pnpm audit`) e aplica correções não destrutivas (`pnpm audit --fix`)
- **Prioriza segurança**: se uma dependência direta vulnerável só puder ser corrigida por uma atualização que quebra o build, a versão segura é aplicada à força e os erros de build são relatados para que o código possa ser atualizado para compatibilidade
- Imprime um resumo (pacotes atualizados vs. pacotes ignorados por quebra de build, vulnerabilidades corrigidas/restantes e um caminho de snapshot do manifesto para rollback manual)

Este script fornece um fluxo de trabalho completo para manter as dependências atualizadas e seguras.

## Verificar pacotes não utilizados {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Atualizar informações de versão {#update-version-information}

```bash
./scripts/update-version.sh
```

Este script atualiza automaticamente as informações de versão em vários arquivos para mantê-los sincronizados. Ele:
- Extrai a versão de `package.json`
- Atualiza o arquivo `.env` com a variável `VERSION` (cria o arquivo se não existir)
- Atualiza o `Dockerfile` com a variável `VERSION` (se existir)
- Atualiza o campo de versão do `documentation/package.json` (se existir)
- Atualiza apenas se a versão tiver mudado
- Fornece feedback sobre cada operação

## Script de pré-verificações {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Este script executa verificações prévias antes de iniciar o servidor de desenvolvimento, compilar ou iniciar o servidor de produção. Ele:
- Garante que o arquivo `.duplistatus.key` exista (via `ensure-key-file.sh`)
- Atualiza as informações de versão (via `update-version.sh`)

Este script é chamado automaticamente por `pnpm dev`, `pnpm build` e `pnpm start-local`.

## Garantir que o arquivo de chave existe {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Este script garante que o arquivo `.duplistatus.key` exista no diretório `data`. Ele:
- Cria o diretório `data` se não existir
- Gera um novo arquivo de chave aleatória de 32 bytes se estiver ausente
- Define as permissões do arquivo como 0400 (somente leitura para o proprietário)
- Corrige permissões se estiverem incorretas

O arquivo de chave é usado para operações criptográficas na aplicação.

## Recuperação de conta Admin {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Este script permite a recuperação de contas de administrador caso haja bloqueio ou esquecimento de senha. Ele:
- Redefine a senha para o usuário especificado
- Desbloqueia a conta se estiver bloqueada
- Redefine o contador de tentativas de login falhas
- Limpa a flag "deve alterar senha"
- Valida se a senha atende aos requisitos de segurança
- Registra a ação no registro de auditoria

**Exemplo:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Este script modifica diretamente o banco de dados. Use apenas quando necessário para recuperação de conta.

## Copiar imagens {#copy-images}

```bash
./scripts/copy-images.sh
```

Copia arquivos de imagem de `documentation/static/img` para seus locais apropriados no aplicativo:
- Copia `favicon.ico` para `src/app/`
- Copia `duplistatus_logo.png` para `public/images/`
- Copia `duplistatus_banner.png` para `public/images/`

Útil para manter as imagens da aplicação sincronizadas com as imagens da documentação.

## Comparar versões entre desenvolvimento e Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Este script compara versões entre seu ambiente de desenvolvimento e um contêiner Docker em execução. Ele:
- Compara versões do SQLite apenas por versão principal (por exemplo, 3.45.1 vs 3.51.1 são consideradas compatíveis, mostradas como "✅ (principal)")
- Compara exatamente as versões do Node, npm e Duplistatus (devem coincidir exatamente)
- Exibe uma tabela formatada mostrando todas as comparações de versão
- Fornece um resumo com resultados codificados por cores (✅ para correspondências, ❌ para divergências)
- Encerra com código 0 se todas as versões coincidirem, 1 se houver divergências

**Requisitos:**
- O container Docker nomeado `duplistatus` deve estar em execução
- O script lê informações de versão dos logs do container Docker

**Saída de exemplo:**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Nota:** As versões do SQLite são comparadas apenas pela versão principal, pois diferentes versões de patch dentro da mesma versão principal são geralmente compatíveis. O script indicará se as versões do SQLite correspondem no nível principal, mas diferem nas versões de patch.

## Visualizando as configurações no banco de dados {#viewing-the-configurations-in-the-database}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Mostrar configurações de backup {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Exibe o conteúdo do valor `backup_settings` na tabela de configurações em uma tabela formatada. Útil para depurar configurações de notificação. Caminho padrão do banco de dados: `data/backups.db`.

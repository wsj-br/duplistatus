# Scripts e Comandos de Administração de Workspace {/* #workspace-admin-scripts--commands */}

## Limpar Banco de Dados {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Limpa o banco de dados removendo todos os dados enquanto preserva o esquema e a estrutura do banco de dados.

>[!CAUTION]
> Use com cuidado, pois isso excluirá todos os dados existentes.

## Limpar artefatos de build e dependências {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Remove todos os artefatos de build, o diretório node_modules e outros arquivos gerados para garantir um estado limpo. Isso é útil quando você precisa realizar uma instalação nova ou resolver problemas de dependência. O comando excluirá:
- Diretório `node_modules/`
- Diretório de build `.next/`
- Diretório `dist/`
- Diretório `out/`
- Diretório `.turbo/`
- Diretório `pnpm-lock.yaml`
- Arquivos de backup JSON de desenvolvimento `data/*.json`
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Diretório `.genkit/`
- Arquivos `*.tsbuildinfo`
- Cache de armazenamento do pnpm (via `pnpm store prune`)
- Cache de build do Docker e limpeza do sistema (imagens, redes, volumes)

## Limpar Docker Compose e ambiente Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Realiza uma limpeza completa do Docker, útil para:
- Liberar espaço em disco
- Remover artefatos Docker antigos/não utilizados
- Limpar após sessões de desenvolvimento ou teste
- Manter um ambiente Docker limpo

## Atualizar os pacotes para a versão mais recente {/* #update-the-packages-to-the-latest-version */}

Você pode atualizar os pacotes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

Ou use o script automatizado (prefira `source` para que o **nvm** se aplique ao seu shell atual; para **CI** ou execuções não interativas, use `CI=1` ou `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

O `upgrade-dependencies.sh` script automatiza todo o processo de atualização de dependências. Ele é independente do projeto: o gerenciador de pacotes, os pacotes do workspace e o comando de verificação de cada pacote são detectados automaticamente (portanto, tanto os pacotes raiz quanto os `documentation/` são atualizados, sem caminhos codificados). Ele:
- Configura as ferramentas por meio do `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Realiza atualizações **seguras para construção** para cada pacote: o `npm-check-updates` resolve as versões mais recentes, em seguida, instala e executa `typecheck`/`lint` a partir da raiz do workspace. As atualizações que falham na verificação são bissectadas editando o `package.json` (não o `pnpm add`, que o pnpm rejeita na raiz do workspace). Os portões de pares incorporados fixam o `eslint` e o `typescript` quando o `eslint-plugin-react` / `typescript-eslint` ainda não permitem a versão principal mais recente.
- Atualiza o arquivo de bloqueio do pnpm do workspace e instala as dependências
- Atualiza o banco de dados browserslist
- Verifica vulnerabilidades (`pnpm audit`) e aplica correções não quebradoras (`pnpm audit --fix`)
- **Prioriza segurança**: se uma dependência direta vulnerável só pode ser corrigida com uma atualização que quebra o build, a versão segura é aplicada e os erros de build são relatados para que o código possa ser atualizado para compatibilidade
- Imprime um resumo (pacotes atualizados vs. pacotes que quebram o build e são ignorados, vulnerabilidades corrigidas/remanescentes e um caminho para snapshot do manifesto para rollback manual)
- Copia `package.json` e arquivos de bloqueio com `/usr/bin/cp` para que um alias `cp` interativo (por exemplo, `cp -i`) não solicite a sobrescrita desses arquivos

Este script fornece um fluxo de trabalho completo para manter as dependências atualizadas e seguras.

## Verificar pacotes não utilizados {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Atualizar informações de versão {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Este script atualiza automaticamente as informações de versão em vários arquivos para mantê-los sincronizados. Ele:
- Extrai a versão de `package.json`
- Atualiza o arquivo `.env` com a variável `VERSION` (cria se não existir)
- Atualiza o `Dockerfile` com a variável `VERSION` (se existir)
- Atualiza o campo de versão do `documentation/package.json` (se existir)
- Só atualiza se a versão tiver mudado
- Fornece feedback em cada operação

## Script de pré-verificações {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Este script executa pré-verificações antes de iniciar o servidor de desenvolvimento, construir ou iniciar o servidor de produção. Ele:
- Garante que o arquivo `.duplistatus.key` exista (via `ensure-key-file.sh`)
- Atualiza as informações de versão (via `update-version.sh`)

Este script é chamado automaticamente por `pnpm dev`, `pnpm build` e `pnpm start-local`.

## Garantir que o arquivo-chave exista {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Este script garante que o arquivo `.duplistatus.key` exista no diretório `data`. Ele:
- Cria o diretório `data` se não existir
- Gera um novo arquivo de chave aleatória de 32 bytes se estiver faltando
- Define as permissões do arquivo para 0400 (somente leitura para o proprietário)
- Corrige as permissões se estiverem incorretas

O arquivo-chave é usado para operações criptográficas na aplicação.

## Recuperação de conta de administrador {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Este script permite a recuperação de contas de administrador se estiverem bloqueadas ou a senha tiver sido esquecida. Ele:
- Redefine a senha do usuário especificado
- Desbloqueia a conta se estiver bloqueada
- Redefine o contador de tentativas de login falhadas
- Limpa a bandeira "deve alterar senha"
- Valida se a senha atende aos requisitos de segurança
- Registra a ação no log de auditoria

**Exemplo:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Este script modifica diretamente o banco de dados. Use apenas quando necessário para recuperação de conta.

## Copiar imagens {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Copia arquivos de imagem de `documentation/static/img` para seus locais apropriados na aplicação:
- Copia `favicon.ico` para `src/app/`
- Copia `duplistatus_logo.png` para `public/images/`
- Copia `duplistatus_banner.png` para `public/images/`

Útil para manter as imagens da aplicação sincronizadas com as imagens da documentação.

## Comparar versões entre desenvolvimento e Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Este script compara as versões entre seu ambiente de desenvolvimento e um contêiner Docker em execução. Ele:
- Compara as versões do SQLite apenas pela versão principal (por exemplo, 3.45.1 vs 3.51.1 são considerados compatíveis, mostrados como "✅ (principal)")
- Compara as versões do Node, npm e Duplistatus exatamente (devem corresponder exatamente)
- Exibe uma tabela formatada mostrando todas as comparações de versão
- Fornece um resumo com resultados coloridos (✅ para correspondências, ❌ para incompatibilidades)
- Sai com código 0 se todas as versões corresponderem, 1 se houver incompatibilidades

**Requisitos:**
- O contêiner Docker chamado `duplistatus` deve estar em execução
- O script lê as informações de versão dos logs do contêiner Docker

**Exemplo de saída:**

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

**Nota:** As versões do SQLite são comparadas apenas pela versão principal porque as versões de patch dentro da mesma versão principal são geralmente compatíveis. O script indicará se as versões do SQLite coincidem no nível principal, mas diferem nas versões de patch.

## Visualizando as configurações no banco de dados {/* #viewing-the-configurations-in-the-database */}

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

## Mostrar configurações de backup {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Exibe o conteúdo do valor `backup_settings` na tabela de configurações em uma tabela formatada. Útil para depuração de configurações de notificação. Caminho padrão do banco de dados: `data/backups.db`.

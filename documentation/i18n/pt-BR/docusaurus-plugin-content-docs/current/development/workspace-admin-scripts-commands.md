# Scripts e Comandos do Administrador do Workspace {/* #workspace-admin-scripts--commands */}

## Limpar Banco de Dados {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Limpa o banco de dados removendo todos os dados enquanto preserva o esquema e a estrutura do banco de dados.

>[!CAUTION]
> Use com cuidado, pois isso excluirá todos os dados existentes.

## Limpar artefatos de compilação e dependências {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Remove todos os artefatos de compilação, diretório node_modules e outros arquivos gerados para garantir um estado limpo. Isso é útil quando você precisa realizar uma instalação limpa ou resolver problemas de dependência. O comando excluirá:
- diretório `node_modules/`
- diretório de compilação `.next/`
- diretório `dist/`
- diretório `out/`
- diretório `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (arquivos de backup JSON de desenvolvimento)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- diretório `.genkit/`
- arquivos `*.tsbuildinfo`
- cache do pnpm store (via `pnpm store prune`)
- cache de compilação do Docker e limpeza do sistema (imagens, redes, volumes)

## Limpar Docker Compose e ambiente Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Realize uma limpeza completa do Docker, que é útil para:
- Liberar espaço em disco
- Remover artefatos antigos/não utilizados do Docker
- Limpar após sessões de desenvolvimento ou testes
- Manter um ambiente do Docker limpo

## Atualizar os pacotes para a versão mais recente {/* #update-the-packages-to-the-latest-version */}

Você pode atualizar pacotes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

Ou use o script automatizado (prefira `source` para que **nvm** se aplique ao seu shell atual; para execuções de **CI** ou não interativas, use `CI=1` ou `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

O script `upgrade-dependencies.sh` automatiza todo o processo de atualização de dependências. É agnóstico ao projeto: o gerenciador de pacotes, os pacotes do workspace e o comando de verificação de cada pacote são detectados automaticamente (portanto, os pacotes raiz e `documentation/` são atualizados, sem caminhos codificados). Ele:
- Fornece configuração de ferramentas via `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Realiza atualizações **seguras para compilação** para cada pacote: `npm-check-updates` resolve as versões mais recentes, depois instala e `typecheck`/`lint` executam a partir da raiz do workspace. As atualizações que falham na verificação são divididas editando `package.json` (não `pnpm add`, que o pnpm rejeita na raiz do workspace). Portais de pares incorporados fixam `eslint` e `typescript` quando `eslint-plugin-react` / `typescript-eslint` ainda não permitem a versão principal mais recente.
- Atualiza o arquivo de bloqueio pnpm do workspace e instala dependências
- Atualiza o banco de dados browserslist
- Verifica vulnerabilidades (`pnpm audit`) e aplica correções não-quebrantes (`pnpm audit --fix`)
- **Prioriza segurança**: se uma dependência direta vulnerável só puder ser corrigida por uma atualização que quebra a compilação, a versão segura é aplicada à força e os erros de compilação são relatados para que o código possa ser atualizado para compatibilidade
- Imprime um resumo (pacotes atualizados vs. pacotes que quebram a compilação ignorados, vulnerabilidades corrigidas/restantes e um caminho de snapshot de manifesto para reversão manual)
- Copia `package.json` e arquivos de bloqueio com `/usr/bin/cp` para que um alias `cp` interativo fornecido (por exemplo `cp -i`) não solicite sobrescrever esses arquivos

Este script fornece um fluxo de trabalho completo para manter as dependências atualizadas e seguras.

## Verificar pacotes não utilizados {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Atualizar informações de versão {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Este script atualiza automaticamente informações de versão em vários arquivos para mantê-los sincronizados. Ele:
- Extrai a versão de `package.json`
- Atualiza o arquivo `.env` com a variável `VERSION` (cria se não existir)
- Atualiza `Dockerfile` com a variável `VERSION` (se existir)
- Atualiza o campo de versão `documentation/package.json` (se existir)
- Atualiza apenas se a versão foi alterada
- Fornece feedback em cada operação

## Script de pré-verificações {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Este script executa pré-verificações antes de iniciar o servidor de desenvolvimento, compilar ou iniciar o servidor de produção. Ele:
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
- Define permissões de arquivo para 0400 (somente leitura para o proprietário)
- Corrige permissões se estiverem incorretas

O arquivo de chave é usado para operações criptográficas na aplicação.

## Recuperação de conta de Administrador {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Este script permite a recuperação de contas de administrador se bloqueadas ou com senha esquecida. Ele:
- Redefine a senha para o usuário especificado
- Desbloqueia a conta se estiver bloqueada
- Redefine o contador de tentativas de login falhadas
- Limpa a flag "Deve Alterar Senha"
- Valida se a senha atende aos requisitos de segurança
- Registra a ação no Log de Auditoria

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

## Alternar entre local ou npm ai-i18n-tools {/* #switch-local-or-npm-ai-i18n-tools */}

```bash
./scripts/link-ai-i18n-tools.sh --local
./scripts/link-ai-i18n-tools.sh --remote
pnpm i18n:tools --local
pnpm i18n:tools --remote
```

Aponta este repositório para um checkout [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) irmão ou de volta para o pacote npm publicado, e então imprime a versão resolvida. `--local` escreve `link:../ai-i18n-tools` (substitua o caminho com `--path` ou `AI_I18N_TOOLS_PATH`) para que `pnpm i18n:*` e `ai-i18n-tools/runtime` usem essa árvore. `--remote` instala a versão mais recente do npm como `^x.y.z`. Não comite o especificador `link:`.

## Comparar versões entre desenvolvimento e Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Este script compara versões entre seu ambiente de desenvolvimento e um contêiner Docker em execução. Ele:
- Compara versões do SQLite apenas pela versão principal (por exemplo, 3.45.1 vs 3.51.1 são consideradas compatíveis, mostradas como "✅ (principal)")
- Compara versões do Node, npm e Duplistatus exatamente (devem corresponder exatamente)
- Exibe uma tabela formatada mostrando todas as comparações de versão
- Fornece um resumo com resultados codificados por cores (✅ para correspondências, ❌ para incompatibilidades)
- Sai com código 0 se todas as versões corresponderem, 1 se houver incompatibilidades

**Requisitos:**
- O contêiner Docker nomeado `duplistatus` deve estar em execução
- O script lê informações de versão dos logs do contêiner Docker

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

**Nota:** As versões do SQLite são comparadas apenas pela versão principal, pois diferentes versões de patch dentro da mesma versão principal geralmente são compatíveis. O script indicará se as versões do SQLite correspondem no nível principal, mas diferem nas versões de patch.

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

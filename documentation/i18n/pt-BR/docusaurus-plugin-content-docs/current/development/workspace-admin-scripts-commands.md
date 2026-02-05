---
translation_last_updated: '2026-02-05T00:21:09.783Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 581bc6778a772b4e
translation_language: pt-BR
source_file_path: development/workspace-admin-scripts-commands.md
---
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

Remove todos os artefatos de compilação, diretório node_modules e outros arquivos gerados para garantir um estado limpo. Isto é útil quando você precisa realizar uma instalação limpa ou resolver problemas de dependência. O comando excluirá:
- Diretório `node_modules/`
- Diretório de compilação `.next/`
- Diretório `dist/`
- Todos os cache de compilação do Docker e executará uma limpeza do sistema Docker
- Cache do armazenamento pnpm
- Recursos do sistema Docker não utilizados (imagens, redes, volumes)
- Quaisquer outros arquivos de cache de compilação

## Limpar Docker Compose e ambiente Docker {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Realizar uma limpeza completa do Docker, que é útil para:
- Liberar espaço em disco
- Remover artefatos antigos/não utilizados do Docker
- Limpar após sessões de desenvolvimento ou testes
- Manter um ambiente Docker limpo

## Atualizar os pacotes para a versão mais recente {#update-the-packages-to-the-latest-version}

Você pode atualizar pacotes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

Ou use o script automatizado:

```bash
./scripts/upgrade-dependencies.sh
```

O script `upgrade-dependencies.sh` automatiza todo o processo de atualização de dependências:
- Atualiza `package.json` com as versões mais recentes usando `npm-check-updates`
- Atualiza o arquivo de bloqueio do pnpm e instala as dependências atualizadas
- Atualiza o banco de dados do browserslist
- Verifica vulnerabilidades usando `pnpm audit`
- Corrige automaticamente vulnerabilidades usando `pnpm audit fix`
- Verifica novamente vulnerabilidades após a correção para confirmar os ajustes

Este script fornece um fluxo de trabalho completo para manter as dependências atualizadas e seguras.

## Verificar pacotes não utilizados {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Atualizar informações de versão {#update-version-information}

```bash
./scripts/update-version.sh
```

Este script atualiza automaticamente informações de versão em múltiplos arquivos para mantê-los sincronizados. Ele:
- Extrai a versão de `package.json`
- Atualiza o arquivo `.env` com a variável `VERSION` (cria-a se não existir)
- Atualiza o `Dockerfile` com a variável `VERSION` (se existir)
- Atualiza o campo de versão em `documentation/package.json` (se existir)
- Atualiza apenas se a versão foi alterada
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
- Gera um novo arquivo de chave aleatória de 32 bytes se estiver faltando
- Define as permissões do arquivo como 0400 (somente leitura para o proprietário)
- Corrige as permissões se estiverem incorretas

O arquivo de chave é usado para operações criptográficas na aplicação.

## Recuperação de conta Admin {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Este script permite a recuperação de contas admin se bloqueadas ou com senha esquecida. Ele:
- Redefine a senha para o usuário especificado
- Desbloqueia a conta se ela estava bloqueada
- Redefine o contador de tentativas de login falhadas
- Limpa a flag "Deve alterar a senha"
- Valida se a senha atende aos requisitos de segurança
- Registra a ação no Log de Auditoria

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

Copia arquivos de imagem de `docs/static/img` para seus locais apropriados na aplicação:
- Copia `favicon.ico` para `src/app/`
- Copia `duplistatus_logo.png` para `public/images/`
- Copia `duplistatus_banner.png` para `public/images/`

Útil para manter as imagens da aplicação sincronizadas com as imagens da documentação.

## Comparar versões entre desenvolvimento e Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Este script compara versões entre seu ambiente de desenvolvimento e um contêiner Docker em execução. Ele:
- Compara versões do SQLite apenas pela versão principal (por exemplo, 3.45.1 vs 3.51.1 são consideradas compatíveis, mostradas como "✅ (major)")
- Compara versões do Node, npm e duplistatus exatamente (devem corresponder exatamente)
- Exibe uma tabela formatada mostrando todas as comparações de versão
- Fornece um resumo com resultados codificados por cores (✅ para correspondências, ❌ para incompatibilidades)
- Sai com código 0 se todas as versões corresponderem, 1 se houver incompatibilidades

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

## Scripts SQL para Depuração e Manutenção {#sql-scripts-for-debugging-and-maintenance}

O projeto inclui scripts SQL para manutenção do banco de dados:

### Excluir Configurações de Backup {#delete-backup-settings}

```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```

Este script remove todas as configurações de backup da tabela de configurações. Use com cuidado, pois isso redefinirá todas as configurações de notificação de backup.

### Excluir Último backup {#delete-last-backup}

```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```

Este script remove o registro de backup mais recente para cada servidor. Por padrão, ele exclui o último backup para TODOS os servidores. O script inclui exemplos comentados para direcionar servidores específicos por nome. Útil para fins de teste e depuração.

**Nota**: O script foi atualizado para funcionar com o esquema de banco de dados atual (usa a tabela `servers` e a coluna `server_id`).

>[!CAUTION]
> Estes scripts SQL modificam diretamente o banco de dados. Sempre faça backup do seu banco de dados antes de executar estes scripts.

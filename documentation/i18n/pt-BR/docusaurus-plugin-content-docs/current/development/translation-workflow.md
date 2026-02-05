---
translation_last_updated: '2026-02-05T00:21:09.584Z'
source_file_mtime: '2026-02-04T21:12:31.724Z'
source_file_hash: f568b098bf1d9861
translation_language: pt-BR
source_file_path: development/translation-workflow.md
---
# Fluxo de Trabalho de Manutenção de Tradução

Para comandos de documentação geral (build, deploy, screenshots, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão geral

A documentação usa Docusaurus i18n com inglês como localidade padrão. A documentação de origem fica em `docs/`; as traduções são escritas em `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Localidades suportadas: en (padrão), fr, de, es, pt-BR.

## Quando a Documentação em Inglês Muda

1. **Atualizar arquivos de origem** em `docs/`
2. **Executar extração** (se as strings da UI do Docusaurus mudaram): `pnpm write-translations`
3. **Atualizar glossário** (se as traduções do intlayer mudaram): `./scripts/generate-glossary.sh` (executar a partir de `documentation/`)
4. **Executar tradução de IA**: `pnpm run translate` (traduz documentos e SVGs; use `--no-svg` apenas para documentos)
5. **Strings da UI** (se a UI do Docusaurus mudou): `pnpm write-translations` extrai novas chaves; documentos e SVGs são traduzidos pelos scripts de IA acima
6. **Testar compilações**: `pnpm build` (compila todos os locales)
7. **Implantar**: Use seu processo de implantação (ex: `pnpm deploy` para GitHub Pages)

## Adicionando Novos Idiomas

1. Adicionar idioma em `docusaurus.config.ts` no array `i18n.locales`
2. Adicionar configuração de idioma no objeto `localeConfigs`
3. Atualizar o array `language` do plugin de pesquisar (use o código de idioma apropriado, por exemplo, `pt` para pt-BR)
4. Adicionar idioma em `translate.config.json` em `locales.targets` (para tradução com IA)
5. Executar tradução com IA: `pnpm run translate` (traduz documentos e SVGs)
6. Criar arquivos de tradução da interface: `pnpm write-translations` (gera estrutura); traduzir documentos e SVGs com `pnpm run translate`

## Ignorar Arquivos

- **`.translate.ignore`**: Padrões no estilo Gitignore para arquivos de documentação a pular durante a tradução por IA. Os caminhos são relativos a `docs/`. Exemplo: `api-reference/*`, `LICENSE.md`
- **`.translate-svg.ignore`**: Padrões para arquivos SVG em `static/img/` a pular durante `translate:svg`. Exemplo: `duplistatus_logo.svg`

## Gerenciamento de Glossário

O glossário de terminologia é gerado automaticamente a partir dos dicionários intlayer para manter consistência entre as traduções da interface do aplicativo e da documentação.

### Gerando o Glossário

```bash
cd documentation
./scripts/generate-glossary.sh
```

Este script:

- Executa `pnpm intlayer build` na raiz do projeto para gerar dicionários
- Extrai terminologia dos arquivos `.intlayer/dictionary/*.json`
- Gera `glossary.csv` e `scripts/glossary-table.md`
- Atualiza a tabela de glossário em `CONTRIBUTING-TRANSLATIONS.md` (se esse arquivo existir)

### Quando Regenerar

- Após atualizar traduções do intlayer na aplicação
- Quando adicionar novos termos técnicos à aplicação
- Antes de trabalhos de tradução importantes para garantir consistência

## Tradução Alimentada por IA

O projeto inclui um sistema de tradução automatizada usando a API OpenRouter que pode traduzir documentação para francês, alemão, espanhol e português brasileiro com cache inteligente e aplicação de glossário.

### Pré-requisitos

1. **Chave da API OpenRouter**: Defina a variável de ambiente `OPENROUTER_API_KEY`:

   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Instalar Dependências**: As dependências estão em `package.json`. Instale com:

   ```bash
   cd documentation
   pnpm install
   ```

3. **Configurações**: O arquivo `translate.config.json` contém configurações padrão. Você pode personalizar modelos, locales e caminhos conforme necessário.

### Ajuda Rápida

Para ver um resumo de todos os comandos de tradução e as opções do script de tradução:

```bash
pnpm run help
# or
pnpm run translate:help
```

Isto exibe `TRANSLATION-HELP.md`.

### Uso Básico

**Traduzir toda a documentação para todos os locales:**

```bash
cd documentation
pnpm run translate
```

**Traduzir para uma localidade específica:**

```bash
pnpm run translate --locale fr    # French
pnpm run translate --locale de    # German
pnpm run translate --locale es    # Spanish
pnpm run translate --locale pt-br # Brazilian Portuguese
```

**Traduzir um arquivo ou diretório específico:**

```bash
pnpm translate --path docs/intro.md
pnpm translate --path docs/development/
```

**Visualizar sem fazer alterações (execução simulada):**

```bash
pnpm run translate:dry-run
```

### Logs de Saída

Tanto `translate` quanto `translate:svg` escrevem toda a saída do console em arquivos de log em `.translation-cache/`:

- `translate_<timestamp>.log` – saída completa de `pnpm run translate`
- `translate-svg_<timestamp>.log` – saída completa de `pnpm run translate:svg` (independente)

O caminho de log é impresso no início de cada execução. Os logs são anexados em tempo real.

### Gerenciamento de Cache

O sistema de tradução usa um cache de dois níveis (nível de arquivo e nível de segmento) armazenado em `.translation-cache/cache.db` para minimizar custos de API:

**Verificar status de tradução:**

```bash
pnpm run translate:status
```

Isto gera uma tabela mostrando o Status de tradução para todos os Arquivos de documentação:

- `✓` = Traduzido e atualizado (hash de origem corresponde)
- `-` = Ainda não traduzido
- `●` = Traduzido mas desatualizado (arquivo de origem alterado)
- `□` = Órfão (existe na pasta de tradução mas não na origem)
- `i` = Ignorado (ignorado por `.translate.ignore`)

O script compara `source_file_hash` no frontmatter do arquivo traduzido com o hash calculado do arquivo de origem para detectar traduções desatualizadas.

**Limpar todos os caches:**

```bash
pnpm translate --clear-cache
```

**Limpar cache para locale específico:**

```bash
pnpm translate --clear-cache fr
```

**Forçar retradução (limpar cache de arquivo, não o cache de traduções):**

```bash
pnpm translate --force
```

**Ignorar cache (forçar chamadas de API, mas ainda persistir novas traduções):**

```bash
pnpm translate --no-cache
```

**Limpar cache (remover entradas órfãs e obsoletas):**

```bash
pnpm run translate:cleanup
```

ou

```bash
pnpm run translate:clean
```

**Editar cache em uma interface web:**

```bash
pnpm run translate:edit-cache
```

Isso fornece um aplicativo web na porta 4000 (ou próxima disponível) para navegar e editar o cache de tradução. Recursos: visualização de tabela com filtros (nome do arquivo, localidade, source_hash, texto de origem, texto traduzido), edição inline de texto traduzido, excluir entrada única, excluir todas as traduções para um caminho de arquivo, paginação, tema escuro. Um ícone mostrar links imprime caminhos de arquivo de origem e traduzido no terminal para que você possa abri-los no seu editor. Execute a partir de `documentation/`.

### Tradução SVG

A tradução de SVG está incluída em `pnpm run translate` por padrão (executa após docs). Arquivos SVG em `static/img/` cujos nomes começam com `duplistatus` são traduzidos.

**Pular SVG** (apenas docs):

```bash
pnpm run translate --no-svg
```

**Apenas SVG** (script independente):

```bash
pnpm run translate:svg
```

Opções: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Usa `.translate-svg.ignore` para exclusões. Opcionalmente exporta PNG via CLI do Inkscape.

### Fluxo de trabalho com tradução de IA

1. **Atualizar documentação em inglês** em `docs/`
2. **Atualizar glossário** (se necessário): `./scripts/generate-glossary.sh`
3. **Executar tradução por IA**: `pnpm run translate` (traduz documentos e SVGs)
4. **Verificar** traduções em `i18n/{locale}/docusaurus-plugin-content-docs/current/` (opcional)
5. **Testar compilações**: `pnpm build`
6. **Implantar** usando seu processo de implantação

### Seleção de Modelo e Otimização de Custos

A configuração padrão usa `anthropic/claude-haiku-4.5`. Você pode modificar `translate.config.json` para usar modelos diferentes:

- **Padrão**: `anthropic/claude-haiku-4.5`
- **Fallback**: `google/gemma-3-27b-it`
- **Alto desempenho**: `anthropic/claude-sonnet-4`
- **Econômico**: `openai/gpt-4o-mini`

**Estratégia de otimização de custos:**

1. Primeira passagem: Use modelo mais barato (`gpt-4o-mini`) para tradução inicial
2. Passagem de qualidade: Re-traduza arquivos problemáticos com `claude-sonnet-4` se necessário

### Solução de problemas

**"OPENROUTER_API_KEY não definido"**

- Exportar a variável de ambiente ou adicionar a `.env.local`

**Erros de limite de taxa**

- O Sistema inclui atrasos automáticos, mas você pode precisar reduzir solicitações paralelas

**Problemas de qualidade de tradução**

- Experimente um modelo diferente em `translate.config.json`
- Adicione mais termos a `glossary.csv`

**Corrupção de cache**

- Execute `pnpm translate --clear-cache` para redefinir
- Execute `pnpm run translate:cleanup` para remover entradas órfãs
- Use `pnpm run translate:edit-cache` para corrigir traduções em cache individuais sem re-traduzir

**Depuração do tráfego OpenRouter**

- O log de tráfego de depuração está **ativado por padrão**. Os logs são gravados em `.translation-cache/debug-traffic-<timestamp>.log`. Use `--debug-traffic <path>` para especificar um nome de arquivo personalizado, ou `--no-debug-traffic` para desativar. As chaves de API nunca são gravadas.
- O tráfego é registrado **apenas quando segmentos são enviados para a API**. Se todos os segmentos forem fornecidos do cache (por exemplo, ao usar `--force`, que limpa o cache de arquivo mas não o cache de segmentos), nenhuma chamada de API é feita e o log conterá apenas um cabeçalho e uma nota. Use `--no-cache` para forçar chamadas de API e capturar tráfego de solicitação/resposta. Novas traduções de uma execução `--no-cache` ainda são gravadas no cache para execuções futuras.
- Exemplo: `pnpm run translate -- --locale pt-BR --debug-traffic my-debug.log --no-cache`

## Rastreamento de Status de Tradução

Acompanhe o progresso da tradução com:

```bash
pnpm run translate:status
```

Isto gera uma tabela e resumo para todos os arquivos de documentação.

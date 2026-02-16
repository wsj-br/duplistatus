---
translation_last_updated: '2026-02-16T02:21:43.520Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: f6b2901b63a4b18c
translation_language: pt-BR
source_file_path: development/translation-workflow.md
---
# Fluxo de Trabalho de Manutenção de Tradução {#translation-maintenance-workflow}

Para comandos de documentação geral (build, deploy, screenshots, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão geral {#overview}

A documentação usa Docusaurus i18n com inglês como localidade padrão. A documentação de origem fica em `docs/`; as traduções são escritas em `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Localidades suportadas: en (padrão), fr, de, es, pt-BR.

## Quando a Documentação em Inglês Muda {#when-english-documentation-changes}

1. **Atualizar arquivos de origem** em `docs/`
2. **Executar extração** (se as strings da UI do Docusaurus mudaram): `pnpm write-translations`
3. **Atualizar glossário** (se as traduções do intlayer mudaram): `pnpm translate:glossary-ui`
4. **Adicionar IDs de Cabeçalho**: `pnpm heading-ids`
5. **Executar tradução por IA**: `pnpm translate` (traduz documentos, strings de UI em JSON e SVGs; use `--no-svg` apenas para documentos, `--no-json` para pular strings de UI)
6. **Strings de UI** (se a UI do Docusaurus mudou): `pnpm write-translations` extrai novas chaves; documentos, strings de UI em JSON e SVGs são traduzidos pelos scripts de IA acima
7. **Testar builds**: `pnpm build` (compila todos os locais)
8. **Implantar**: Use seu processo de implantação (por exemplo, `pnpm deploy` para GitHub Pages)

<br/>

## Adicionando Novos Idiomas {#adding-new-languages}

1. Adicionar local em `docusaurus.config.ts` no array `i18n.locales`
2. Adicionar configuração de local no objeto `localeConfigs`
3. Atualizar array de idiomas do plugin de pesquisa (usar código de idioma apropriado, por exemplo, `pt` para pt-BR)
4. Adicionar local em `translate.config.json` em `locales.targets` (para tradução por IA)
5. Executar tradução por IA: `pnpm translate` (traduz documentos, strings de UI em JSON e SVGs)
6. Criar arquivos de tradução de UI: `pnpm write-translations` (gera estrutura); traduzir documentos, strings de UI em JSON e SVGs com `pnpm translate`

<br/>

## Tradução Alimentada por IA {#ai-powered-translation}

O projeto inclui um sistema de tradução automatizada usando a API OpenRouter que pode traduzir documentação para francês, alemão, espanhol e português brasileiro com cache inteligente e aplicação de glossário.

### Pré-requisitos {#prerequisites}

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

Para ver um resumo de todos os comandos de tradução e as opções do script de tradução:

   ```bash
   pnpm help
   # or
   pnpm translate:help
   ```

### Uso Básico {#basic-usage}

**Traduzir toda a documentação para todos os locales:**

      ```bash
      cd documentation
      pnpm translate
      ```

**Traduzir para uma localidade específica:**

      ```bash
      pnpm translate --locale fr    # French
      pnpm translate --locale de    # German
      pnpm translate --locale es    # Spanish
      pnpm translate --locale pt-br # Brazilian Portuguese
      ```

**Traduzir um arquivo ou diretório específico:**

      ```bash
      pnpm translate --path docs/intro.md
      pnpm translate --path docs/development/
      ```

**Visualizar sem fazer alterações (execução simulada):**

      ```bash
      pnpm translate --dry-run
      ```

### Configuração do Modelo {#model-configuration}

O sistema de tradução usa modelos configurados em `translate.config.json`, um principal e um de contingência.

| Configuração | Notas                               | Modelo Padrão                |
|---------------|-------------------------------------|------------------------------|
| defaultModel  | Modelo principal para traduções     | `anthropic/claude-3.5-haiku` |
| fallbackModel | Contingência usada se o modelo principal falhar | `anthropic/claude-haiku-4.5` |

Verifique a lista de todos os modelos disponíveis e seus custos associados na [página do Openrouter.ai](https://openrouter.ai/models)

### Testando a qualidade da tradução {#testing-the-quality-of-the-translation}

Para testar a qualidade de um novo modelo, altere o `defaultModel` no `translate.config.json` e execute a tradução para um arquivo, por exemplo:

```bash
pnpm translate --force --path docs/intro.md --no-cache --locale pt-BR
```

e verifique o arquivo traduzido em `i18n/pt-BR/docusaurus-plugin-content-docs/current/intro.md`

### Ignorar Arquivos {#ignore-files}

Adicione os arquivos a serem ignorados durante a tradução por IA no arquivo `.translate-ignore` (no mesmo estilo do `.gitignore`).

Exemplo:

```bash
# Documentation files
# Keep the license in English
LICENSE.md

# Don't translate the API reference
api-reference/*

# Dashboard/table diagram - not referenced in docs
duplistatus_dash-table.svg
```

### Gerenciamento de Glossário {#glossary-management}

O glossário de terminologia é gerado automaticamente a partir dos dicionários intlayer para manter consistência entre as traduções da interface do aplicativo e da documentação.

#### Gerando o Glossário {#generating-the-glossary}

```bash
cd documentation
pnpm translate:glossary-ui
```

Este script:

- Executa `pnpm intlayer build` na raiz do projeto para gerar dicionários
- Extrai terminologia dos arquivos `.intlayer/dictionary/*.json`
- Gera `glossary-ui.csv`
- Atualiza a tabela de glossário em `CONTRIBUTING-TRANSLATIONS.md` (se esse arquivo existir)

#### Quando Regenerar {#when-to-regenerate}

- Após atualizar traduções do intlayer na aplicação
- Quando adicionar novos termos técnicos à aplicação
- Antes de trabalhos de tradução importantes para garantir consistência

#### Substituições de Glossário do Usuário {#user-glossary-overrides}

`glossary-user.csv` permite substituir ou adicionar termos sem modificar o glossário de UI gerado. Formato: `en`, `locale`, `tradução` (uma linha por termo por localidade). Usee). como localidade para aplicar um termo a todos os locais configurados. As entradas têm precedência sobre `glossary-ui.csv`.

### Gerenciamento de Cache {#cache-management}

O sistema de tradução usa um cache de dois níveis (nível de arquivo e nível de segmento) armazenado em `.translation-cache/cache.db` para minimizar os custos de API. Este arquivo é incluído no repositório Git para reduzir os custos futuros de tradução.

Comandos de Gerenciamento de Cache:

| Comando                                 | Descrição                                                           |
|-----------------------------------------|-----------------------------------------------------------------------|
| `pnpm translate --clear-cache <locale>` | Limpar cache para locale específico                                       |
| `pnpm translate --clear-cache`          | Limpar cache **todos** (arquivo e segmento)                           |
| `pnpm translate --force`                | Forçar re-tradução (limpa cache de arquivo, mantém cache de segmento)         |
| `pnpm translate --no-cache`             | Ignorar cache completamente (forçar chamadas de API, ainda salva novas traduções) |
| `pnpm translate:editor`             | Revisão manual, excluir ou editar entradas de cache                           |

### Remover cache órfão e obsoleto {#remove-orphaned-and-stale-cache}

Quando alterações são feitas em documentos existentes, as entradas de cache podem se tornar órfãs ou desatualizadas. Use os comandos para excluir entradas que não são mais necessárias, reduzindo o tamanho do cache de tradução.

```bash
pnpm translate --force
pnpm translate:cleanup
```

:::warning
Antes de executar o script de limpeza, certifique-se de ter executado `pnpm translate --force`. Esta etapa é crucial para evitar a exclusão acidental de entradas válidas marcadas como obsoletas.

O script cria automaticamente um backup na pasta `.translation-cache`, permitindo que você recupere quaisquer dados excluídos, se necessário.
:::

<br/>

### Revisão manual do cache {#manual-review-of-the-cache}

Ao revisar traduções, use a ferramenta de edição de cache baseada na web para visualizar traduções de termos específicos, excluir entradas de cache, excluir entradas usando os filtros disponíveis ou excluir arquivos específicos. Isso permite que você traduza novamente apenas os textos ou arquivos desejados.

Por exemplo, se um modelo traduziu incorretamente um termo, você pode filtrar todas as entradas para esse termo, alterar o modelo no arquivo `translate.config.json` e retraduzir apenas as linhas que contêm esses termos usando o novo modelo.

```bash
pnpm translate:editor
```

Isso abrirá uma interface do usuário da web para navegar e editar o cache manualmente (porta 4000 ou 4000+), para que você possa:
   - Visualização de tabela com recursos de filtragem
   - Edição inline de texto traduzido
   - Excluir uma única entrada, traduções para um arquivo específico ou entradas filtradas
   - Imprimir caminhos de arquivos de origem e traduzidos no terminal para acesso rápido do editor

![Translate Edit-Cache App](/img/screenshot-translate-edit-cache.png)

<br/>

### IDs e Âncoras de Cabeçalhos {#heading-ids-and-anchors}

Links de âncora consistentes (IDs) são cruciais para referências cruzadas, sumário e links diretos. Quando o conteúdo é traduzido, o texto do cabeçalho muda, o que normalmente faria com que os IDs de âncora gerados automaticamente diferissem entre idiomas.

```markdown
 ## This is a Heading {#this-is-a-heading}
```

Após atualizar ou criar um novo arquivo fonte em inglês, execute isto para garantir IDs explícitos:

```bash
cd documentation
pnpm heading-ids   # Adds {#id} to all headings without explicit IDs
```

:::note
Sempre use o ID gerado ao fazer referências cruzadas de seções da documentação.
:::

<br/>

### Tradução de SVG {#svg-translation}

A tradução de SVG está incluída em `pnpm translate` por padrão (executa após os documentos). Arquivos SVG em `static/img/` cujos nomes começam com `duplistatus` são traduzidos.

**Pular SVG** (apenas docs):

```bash
pnpm translate --no-svg
```

**Apenas SVG** (script independente):

```bash
pnpm translate:svg
```

Opções: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Usa `.translate-ignore` para exclusões.

<br/>

### Tradução de Strings de Interface (JSON) {#ui-strings-translation-json}

Strings de interface do usuário do Docusaurus e rótulos de componentes personalizados são armazenados em arquivos de tradução JSON. Estes são gerados automaticamente por `pnpm write-translations` e depois traduzidos pelo sistema de IA.

**Como funciona:**

1. **Extração**: `pnpm write-translations` examina arquivos de tema do Docusaurus e componentes React personalizados em busca de strings traduzíveis (como "Próximo", "Anterior", "Pesquisar", rótulos de botões) e as grava em `i18n/en/` como arquivos JSON. Cada arquivo corresponde a um plugin ou tema do Docusaurus.
2. **Tradução**: `pnpm translate` (com suporte a JSON habilitado) traduz esses arquivos JSON para todos os locais de destino usando o modelo de IA, respeitando o glossário.
3. **Uso**: O Docusaurus carrega automaticamente os arquivos JSON do local apropriado em tempo de execução para exibir a interface do usuário no idioma selecionado.

**Arquivos JSON principais** (todos em `i18n/{locale}/`):
- `docusaurus-plugin-content-docs/current.json` - Strings de interface do usuário da documentação (pesquisa, navegação, sumário)
- `docusaurus-theme-classic/navbar.json` - Itens da barra de navegação
- `docusaurus-theme-classic/footer.json` - Itens do rodapé
- `code.json` - Rótulos de bloco de código (copiar, recolher, expandir)
- Outros arquivos JSON específicos de plugins

**Pular tradução de JSON** (apenas documentos):

```bash
pnpm translate --no-json
```

**Importante**: As strings de interface do usuário geralmente são estáveis, mas se você adicionar novos componentes personalizados com texto traduzível, deve executar `pnpm write-translations` para extrair essas novas strings antes de executar `pnpm translate`. Caso contrário, as novas strings aparecerão apenas em inglês para todos os locais.

<br/>

O comando `translate` registra toda a saída do console e tráfego de API em arquivos no diretório `.translation-cache/`. Os logs incluem:

- `translate_<timestamp>.log`: Um log abrangente da saída do comando `pnpm translate`.
- `debug-traffic-<timestamp>.log`: Um log de todo o tráfego enviado e recebido do modelo de IA.

Observe que o tráfego de API só é registrado quando os segmentos são enviados à API. 
   Se todos os segmentos forem recuperados do cache (por exemplo, ao usar a opção `--force`, que 
   sobrescreve o cache de arquivo, mas não as traduções do segmento), nenhuma chamada de API será feita, e 
   o log conterá apenas um cabeçalho e uma nota.

Para forçar chamadas de API e capturar o tráfego de solicitação/resposta, 
   use a opção `--no-cache`.

<br/>

## Fluxo de Trabalho com Tradução de IA {#workflow-with-ai-translation}

1. **Atualizar documentação em inglês** em `docs/`
2. **Atualizar glossário** (se necessário): `pnpm translate:glossary-ui` e `glossary-user.csv`.
3. **Atualizar os IDs de cabeçalhos**: `pnpm headings-ids`
4. **Executar tradução de IA**: `pnpm translate` (traduz docs, json e SVGs)
5. **Verificar** traduções em `i18n/{locale}/docusaurus-plugin-content-docs/current/` (opcional)
6. **Testar builds**: `pnpm build`
7. **Implantar** usando seu processo de implantação

<br/>

## Solução de Problemas {#troubleshooting}

**"OPENROUTER_API_KEY não definido"**

- Exportar a variável de ambiente ou adicionar a `.env.local`

**Problemas de qualidade de tradução**

- Tente um modelo diferente no `translate.config.json`
- Exclua entradas no cache e use outro modelo
- Revise o documento em inglês e reescreva-o para tornar a tradução clara
- Adicione mais termos ao `glossary-ui.csv` ou adicione substituições ao `glossary-user.csv` (en, locale, tradução)

**Corrupção de cache**

- Execute `pnpm translate --clear-cache` para redefinir
- Execute `pnpm translate:cleanup` para remover entradas órfãs
- Use `pnpm translate:editor` para corrigir/excluir traduções em cache individuais sem re-traduzir o documento inteiro

**Depuração do tráfego OpenRouter**

- Logs são gravados em `.translation-cache/debug-traffic-<timestamp>.log`. 
- Use este log para verificar se o problema de tradução está relacionado ao script, prompts usados ou ao modelo.

## Rastreamento de Status de Tradução {#translation-status-tracking}

Acompanhe o progresso da tradução com:

```bash
pnpm translate:status
```

Isso gera uma tabela mostrando o status de tradução para todos os arquivos de documentação. Por exemplo:

![Translate Status](/img/screenshot-translate-status.png)

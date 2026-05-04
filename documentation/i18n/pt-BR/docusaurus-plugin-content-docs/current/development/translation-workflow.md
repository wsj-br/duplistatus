---
translation_last_updated: '2026-04-18T00:02:02.319Z'
source_file_mtime: '2026-04-16T19:04:53.276Z'
source_file_hash: 5ab3aefe73273ae2660374b90a091f43326249c300a85e0a531363030a9ca392
translation_language: pt-BR
source_file_path: documentation/docs/development/translation-workflow.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Fluxo de Trabalho de Manutenção de Tradução {#translation-maintenance-workflow}

Para comandos de documentação geral (build, deploy, screenshots, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão geral {#overview}

A documentação utiliza o i18n do Docusaurus com o idioma inglês como localidade padrão. A documentação original reside em `docs/`; as traduções são escritas em `i18n/{locale}/`. Localidades suportadas: en (padrão), fr, de, es, pt-BR.

**Tradução por IA** para a interface do aplicativo, markdown/JSON do Docusaurus e ativos SVG é gerenciada por [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) a partir da **raiz do repositório**, configurada em `ai-i18n-tools.config.json` (não dentro de `documentation/`). Defina `OPENROUTER_API_KEY` ao executar comandos de tradução.

## Quando a documentação em inglês mudar {#when-english-documentation-changes}

1. **Edite a fonte** em `documentation/docs/` (somente inglês).
2. **Strings da interface do Docusaurus** (rótulos do tema, barra de navegação, etc.): se necessário, execute `pnpm write-translations` em `documentation/` para que `i18n/en/*.json` detecte as novas chaves.
3. **IDs de títulos**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduza** a partir da **raiz do repositório** (ou use os atalhos abaixo a partir de `documentation/`):
   - `pnpm i18n:extract` — atualizar `src/locales/strings.json` de `t('…')` no aplicativo Next.js.
   - `pnpm i18n:translate:docs` — traduzir markdown/JSON para `documentation/i18n/` conforme a configuração.
   - `pnpm i18n:translate:svg` — traduzir SVGs em `documentation/static/img` conforme configurado.
   - Ou execute tudo: `pnpm i18n:translate`.
5. **Compilação**: `cd documentation && pnpm build` (todas as localidades).

A partir de dentro de `documentation/`, os mesmos fluxos são conectados como `pnpm translate` → raiz `i18n:translate`, além de `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glossário {#glossary-management}

- **Terminologia da interface** para documentação é definida por `glossary.uiGlossary` em `ai-i18n-tools.config.json`, apontando para `src/locales/strings.json` (o catálogo gerado por `pnpm i18n:extract`).
- **Substituições** ficam em `documentation/glossary-user.csv` (`glossary.userGlossary` na configuração). Veja a [documentação de glossário do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para o formato das colunas.
- Gere um modelo CSV: `pnpm i18n:glossary-generate` (raiz).

## Cache {#cache-management}

O cache de tradução para o ai-i18n-tools está em **`.translation-cache/`** na raiz do repositório (`cacheDir` em `ai-i18n-tools.config.json`). Está no gitignore. Use `pnpm i18n:status` e as flags `--force` / cache da CLI conforme a documentação do [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) quando precisar de uma atualização completa.

## IDs de títulos e âncoras {#heading-ids-and-anchors}

Use IDs explícitos para que os links permaneçam estáveis entre os idiomas:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de ignorados {#ignore-files}

Use **`.translate-ignore`** na raiz do repositório (mesma ideia de `.gitignore`) para caminhos que o tradutor de documentação deve ignorar, caso você adicione um ao seu fluxo de trabalho.

## JSON do tema Docusaurus {#ui-strings-translation-json}

`pnpm write-translations` extrai as strings da interface do Docusaurus para `documentation/i18n/en/`. A etapa `translate-docs` do **ai-i18n-tools** (com `markdownOutput.style: "docusaurus"`) preenche os JSON traduzidos em cada localidade ao lado do markdown, conforme `ai-i18n-tools.config.json`.

## Solução de Problemas {#troubleshooting}

- **`OPENROUTER_API_KEY` não definido** — exporte-o ou adicione a `.env.local` na raiz do repositório.
- **Modelo / qualidade** — ajuste `openrouter.translationModels` e opções relacionadas em `ai-i18n-tools.config.json`.
- **Glossário** — edite `documentation/glossary-user.csv` ou regenere as strings da interface e execute novamente extração + tradução.

## Adicionando um novo idioma {#adding-new-languages}

1. Adicione a localidade ao Docusaurus `i18n.locales` e `localeConfigs` em `documentation/docusaurus.config.ts`.
2. Adicione a mesma localidade a `targetLocales` em **`ai-i18n-tools.config.json`** (raiz do repositório).
3. Execute `pnpm i18n:generate-ui-languages` na raiz, depois `pnpm i18n:extract` / comandos de tradução conforme necessário.

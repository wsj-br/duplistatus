# Fluxo de Manutenção de Tradução {/* #translation-maintenance-workflow */}

Para comandos gerais de documentação (build, deploy, screenshots, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão Geral {/* #overview */}

A documentação usa Docusaurus i18n com inglês como o locale padrão. A documentação de origem fica em `docs/`; traduções são escritas em `i18n/{locale}/`. Locales suportados: en-GB (padrão), fr, de, es, pt-BR, hi, zh-Hans.

**Tradução de IA** para a interface do aplicativo, documentos Docusaurus em markdown/JSON, ativos SVG e **modelos de notificação padrão** é tratada pelo [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) a partir da raiz do **repositório**, configurado em `ai-i18n-tools.config.json` (não dentro de `documentation/`). Defina `OPENROUTER_API_KEY` ao executar os comandos de tradução.

## Quando a documentação em inglês muda {/* #when-english-documentation-changes */}

1. **Edite a origem** em `documentation/docs/` (apenas inglês).
2. **Strings de UI do Docusaurus** (rótulos do tema, barra de navegação, etc.): se necessário, execute `pnpm write-translations` em `documentation/` para que `i18n/en/*.json` capture novas chaves.
3. **IDs de cabeçalho**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduza** a partir da **raiz do repositório** (ou use os atalhos abaixo de `documentation/`):
   - `pnpm i18n:extract` — atualize `src/locales/strings.json` de `t('…')` no aplicativo Next.js.
   - `pnpm i18n:translate:docs` — traduza markdown/JSON para `documentation/i18n/` conforme a configuração.
   - `pnpm i18n:translate:svg` — traduza SVGs em `documentation/static/img` conforme configurado.
   - `pnpm i18n:translate:json` — traduza modelos de notificação padrão em `src/locales/templates/` de `en-GB.json`.
   - Ou execute tudo: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (todos os locales).

A partir de dentro de `documentation/`, os mesmos fluxos são conectados como `pnpm translate` → raiz `i18n:translate`, mais `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Plurais na UI {/* #ui-plurals */}

Plurais cardinais no aplicativo Next.js usam **ai-i18n-tools**, não chaves `_one` / `_other` escritas manualmente.

Escreva uma string de origem em inglês (geralmente o plural) e passe um **literal de objeto simples** com `plurals: true` e um `count` numérico:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regras:

- Não use `item(s)` rodeios ou `count === 1 ? t('…') : t('…')` pares.
- Contagens **numéricas** independentes precisam de chamadas `t()` separadas — um eixo plural não pode flexionar dois números (por exemplo, 1 bem-sucedido e 2 falhas). Concatene os fragmentos:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Interpolações não numéricas (nomes, rótulos, etc.) estão bem na mesma string plural junto com `{{count}}`.
- `pnpm i18n:extract` marca a linha do catálogo `"plural": true`. `pnpm i18n:translate:ui` preenche formas CLDR e escreve `src/locales/en-GB.json` (apenas chaves de plural).
- `src/i18n.ts` e `src/lib/i18n-server.ts` carregam esse arquivo como `sourcePluralFlatBundle` para que singular/plural em inglês resolvam em tempo de execução.

## Modelos de Notificação Padrão {/* #default-notification-templates */}

Configurações → Modelos → **Redefinir** carrega os padrões de `src/locales/templates/{locale}.json` (conectado em `src/lib/default-notification-templates.ts`).

1. Edite apenas **`src/locales/templates/en-GB.json`** (origem em inglês).
2. Execute **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) a partir da raiz do repositório.
3. Revise as diferenças — placeholders como `{backup_name}` e `{problem_table}` devem permanecer inalterados; `priority` e `tags` são ignorados por `keyPolicy` em `ai-i18n-tools.config.json`.
4. Execute **`pnpm i18n:status`** para ver a cobertura do bloco JSON.

Consulte o [guia JSON do ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) para flags (`--locale`, `--force`, etc.).

## Glossário {/* #glossary */}

- A **terminologia da UI** para documentação é orientada por `glossary.uiGlossary` em `ai-i18n-tools.config.json`, apontando para `src/locales/strings.json` (o catálogo produzido por `pnpm i18n:extract`).
- **Sobrescritas** residem em `documentation/glossary-user.csv` (`glossary.userGlossary` na configuração). Consulte a [documentação do glossário do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para o formato da coluna.
- Gere um modelo CSV: `pnpm i18n:glossary-generate` (raiz).

## Cache {/* #cache */}

O cache de tradução para o ai-i18n-tools está em `.translation-cache/` na raiz do repositório (`cacheDir` em `ai-i18n-tools.config.json`). Ele é ignorado pelo git. Use `pnpm i18n:status` e as bandeiras do CLI `--force` / cache conforme a [documentação do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) quando precisar de uma atualização completa.

## IDs e âncoras de cabeçalhos {/* #heading-ids-and-anchors */}

Use IDs explícitos para que os links fiquem estáveis entre idiomas. Prefira a sintaxe de comentário MDX (`pnpm write-heading-ids` usa `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Coloque IDs em `h2` e abaixo. O `write-heading-ids` do Docusaurus ignora `h1` (o título da página/barra lateral). O `documentation/docusaurus.config.ts` também remove comentários de heading-id dos títulos inferidos, porque a extração de metadados do Docusaurus ainda só remove `{#id}` clássico.

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de ignorados {/* #ignore-lists */}

Use `.translate-ignore` na raiz do repositório (mesma ideia que `.gitignore`) para caminhos que o tradutor de documentos deve ignorar, se você adicionar um para seu fluxo de trabalho.

## JSON do tema Docusaurus {/* #docusaurus-theme-json */}

O `pnpm write-translations` extrai strings da UI do Docusaurus em `documentation/i18n/en/`. A etapa `translate-docs` do **ai-i18n-tools** (com `markdownOutput.style: "docusaurus"`) preenche JSON traduzido sob cada localidade ao lado do markdown, conforme `ai-i18n-tools.config.json`.

## Solução de problemas {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **não definido** — exporte-o ou adicione à `.env.local` na raiz do repositório.
- **Modelo / qualidade** — ajuste `openrouter.translationModels` e opções relacionadas em `ai-i18n-tools.config.json`.
- **Glossário** — edite `documentation/glossary-user.csv` ou regenere strings da UI e execute extrair + traduzir novamente.

## Adicionando um novo idioma {/* #adding-a-new-language */}

1. Adicione a localidade ao Docusaurus `i18n.locales` e `localeConfigs` em `documentation/docusaurus.config.ts`.
2. Adicione a mesma localidade ao `targetLocales` em `ai-i18n-tools.config.json` (raiz do repositório).
3. Execute `pnpm i18n:generate-ui-languages` na raiz, depois os comandos `pnpm i18n:extract` / traduzir conforme necessário.

# Fluxo de Trabalho de Manutenção de Tradução {#translation-maintenance-workflow}

Para comandos de documentação geral (build, deploy, screenshots, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão geral {#overview}

A documentação utiliza o i18n do Docusaurus com o inglês como o idioma padrão. A documentação de origem reside em `docs/`; as traduções são escritas em `i18n/{locale}/`. Idiomas suportados: en-GB (padrão), fr, de, es, pt-BR, hi, zh-Hans.

**Tradução de IA** para a interface do aplicativo, documentos Docusaurus em markdown/JSON, ativos SVG e **modelos de notificação padrão** é tratada pelo [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) a partir da raiz do **repositório**, configurado em `ai-i18n-tools.config.json` (não dentro de `documentation/`). Defina `OPENROUTER_API_KEY` ao executar comandos de tradução.

## Quando a documentação em inglês mudar {#when-english-documentation-changes}

1. **Edite a fonte** em `documentation/docs/` (somente em inglês).
2. **Strings da interface do Docusaurus** (rótulos de tema, barra de navegação, etc.): se necessário, execute `pnpm write-translations` em `documentation/` para que o `i18n/en/*.json` detecte as novas chaves.
3. **IDs de títulos**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduza** a partir da **raiz do repositório** (ou use os atalhos abaixo a partir de `documentation/`):
   - `pnpm i18n:extract` — atualize `src/locales/strings.json` de `t('…')` no aplicativo Next.js.
   - `pnpm i18n:translate:docs` — traduza markdown/JSON para `documentation/i18n/` conforme a configuração.
   - `pnpm i18n:translate:svg` — traduza SVGs em `documentation/static/img` conforme configurado.
   - `pnpm i18n:translate:json` — traduza modelos de notificação padrão em `src/locales/templates/` de `en-GB.json`.
   - Ou execute tudo: `pnpm i18n:translate`.
5. **Construir**: `cd documentation && pnpm build` (todos os idiomas).

A partir de dentro de `documentation/`, os mesmos fluxos são conectados como `pnpm translate` → raiz `i18n:translate`, além de `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Plurais na interface do usuário {#ui-plurals}

Plurais cardinais no aplicativo Next.js usam **ai-i18n-tools**, não chaves `_one` / `_other` escritas manualmente.

Escreva uma única string em inglês (geralmente a plural) e passe um **objeto literal simples** com `plurals: true` e um `count` numérico:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regras:

- Não use `item(s)` hedges ou `count === 1 ? t('…') : t('…')` pares.
- Contagens **numéricas** independentes precisam de chamadas `t()` separadas — um eixo plural não pode flexionar dois números (por exemplo, 1 bem-sucedido e 2 Falha). Concatene os fragmentos:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Interpolação não numérica (nomes, rótulos, etc.) é aceitável na mesma string plural que `{{count}}`.
- `pnpm i18n:extract` marca a linha do catálogo `"plural": true`. `pnpm i18n:translate:ui` preenche formulários CLDR e escreve `src/locales/en-GB.json` (apenas chaves plurais).
- `src/i18n.ts` e `src/lib/i18n-server.ts` carregam esse arquivo como `sourcePluralFlatBundle` para que o singular/plural em inglês seja resolvido em tempo de execução.

## Modelos de notificação padrão {#default-notification-templates}

Configurações → Modelos → **Redefinir** carrega os padrões de `src/locales/templates/{locale}.json` (conectado em `src/lib/default-notification-templates.ts`).

1. Edite apenas **`src/locales/templates/en-GB.json`** (fonte em inglês).
2. Execute **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) a partir da raiz do repositório.
3. Revise as diferenças — placeholders como `{backup_name}` e `{problem_table}` devem permanecer inalterados; `priority` e `tags` são ignorados por `keyPolicy` em `ai-i18n-tools.config.json`.
4. Execute **`pnpm i18n:status`** para ver a cobertura do bloco JSON.

Consulte o [guia JSON do ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) para bandeiras (`--locale`, `--force`, etc.).

## Glossário {#glossary}

- **Terminologia da interface** para documentação é definida por `glossary.uiGlossary` em `ai-i18n-tools.config.json`, apontando para `src/locales/strings.json` (o catálogo gerado por `pnpm i18n:extract`).
- **Substituições** ficam em `documentation/glossary-user.csv` (`glossary.userGlossary` na configuração). Veja a [documentação de glossário do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para o formato das colunas.
- Gere um modelo CSV: `pnpm i18n:glossary-generate` (raiz).

## Cache {#cache}

O cache de tradução para o ai-i18n-tools está em `.translation-cache/` na raiz do repositório (`cacheDir` em `ai-i18n-tools.config.json`). Ele é ignorado pelo git. Use `pnpm i18n:status` e as opções `--force` / cache da CLI conforme a documentação do [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) quando precisar de uma atualização completa.

## IDs de títulos e âncoras {#heading-ids-and-anchors}

Use IDs explícitos para que os links permaneçam estáveis entre os idiomas:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de ignorados {#ignore-lists}

Use `.translate-ignore` na raiz do repositório (mesma ideia do `.gitignore`) para caminhos que o tradutor de documentos deve ignorar, caso você adicione um ao seu fluxo de trabalho.

## Tema JSON do Docusaurus {#docusaurus-theme-json}

`pnpm write-translations` extrai as strings da interface do Docusaurus para `documentation/i18n/en/`. A etapa `translate-docs` do **ai-i18n-tools** (com `markdownOutput.style: "docusaurus"`) preenche os JSON traduzidos em cada localidade ao lado do markdown, conforme `ai-i18n-tools.config.json`.

## Solução de Problemas {#troubleshooting}

- `OPENROUTER_API_KEY` **não definido** — exporte-o ou adicione ao `.env.local` na raiz do repositório.
- **Modelo / qualidade** — ajuste `openrouter.translationModels` e opções relacionadas em `ai-i18n-tools.config.json`.
- **Glossário** — edite `documentation/glossary-user.csv` ou regenere as strings da interface e execute novamente extract + translate.

## Adicionando um novo idioma {#adding-a-new-language}

1. Adicione a localidade ao `i18n.locales` e ao `localeConfigs` do Docusaurus em `documentation/docusaurus.config.ts`.
2. Adicione a mesma localidade ao `targetLocales` em `ai-i18n-tools.config.json` (raiz do repositório).
3. Execute `pnpm i18n:generate-ui-languages` na raiz, depois os comandos `pnpm i18n:extract` / translate conforme necessário.

# Fluxo de Manutenção de Tradução {/* #translation-maintenance-workflow */}

Para comandos gerais de documentação (compilação, implantação, capturas de tela, geração de README), consulte [Ferramentas de Documentação](documentation-tools.md).

## Visão geral {/* #overview */}

A documentação usa Docusaurus i18n com inglês como localidade padrão. A documentação de origem fica em `docs/`; as traduções são escritas em `i18n/{locale}/`. Localidades suportadas: en-GB (padrão), fr, de, es, pt-BR, hi, zh-Hans.

**Tradução por IA** para a interface do aplicativo, markdown/JSON do Docusaurus, ativos SVG e **modelos de notificação padrão** é tratada por [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) da **raiz do repositório**, configurada em `ai-i18n-tools.config.json` (não dentro de `documentation/`). Defina `OPENROUTER_API_KEY` ao executar comandos de tradução.

Para tentar um checkout não publicado na mesma máquina (padrão `../ai-i18n-tools`), troque a dependência com `pnpm i18n:tools --local` ou `./scripts/link-ai-i18n-tools.sh --local`. Isso vincula tanto a CLI (`pnpm i18n:*`) quanto a importação de `ai-i18n-tools/runtime`. Reconstrua o pacote de ferramentas após as alterações de fonte (`pnpm build` nesse checkout). Restaure o pacote npm mais recente com `--remote`. Não comite o especificador `link:`.

## Quando a documentação em inglês muda {/* #when-english-documentation-changes */}

1. **Edite a fonte** em `documentation/docs/` (somente em inglês).
2. **Strings da interface do Docusaurus** (rótulos de tema, barra de navegação, etc.): se necessário, execute `pnpm write-translations` em `documentation/` para que `i18n/en/*.json` capture novas chaves.
3. **IDs de cabeçalho**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduza** a partir da **raiz do repositório** (ou use os atalhos abaixo de `documentation/`):
   - `pnpm i18n:extract` — atualizar `src/locales/strings.json` de `t('…')` no aplicativo Next.js.
   - `pnpm i18n:translate:docs` — traduzir markdown/JSON para `documentation/i18n/` conforme a configuração.
   - `pnpm i18n:translate:svg` — traduzir SVGs sob `documentation/static/img` conforme configurado.
   - `pnpm i18n:translate:json` — traduzir modelos de notificação padrão em `src/locales/templates/` de `en-GB.json`.
   - Ou execute tudo: `pnpm i18n:translate`.
5. **Construir**: `cd documentation && pnpm build` (todos os locais).

De dentro de `documentation/`, os mesmos fluxos são conectados como `pnpm translate` → raiz `i18n:translate`, mais `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Plurais da interface {/* #ui-plurals */}

Plurais cardinais no aplicativo Next.js usam **ai-i18n-tools**, não chaves `_one` / `_other` escritas manualmente.

Escreva uma string de origem em inglês (geralmente o plural) e passe um **objeto literal simples** com `plurals: true` e um `count` numérico:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regras:

- Não use `item(s)` hedges ou pares `count === 1 ? t('…') : t('…')`.
- Contagens **numéricas** independentes precisam de chamadas `t()` separadas — um eixo plural não pode flexionar dois números (por exemplo, 1 bem-sucedido e 2 falhados). Concatene os fragmentos:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Interpolações não numéricas (nomes, rótulos, etc.) são adequadas na mesma string plural que `{{count}}`.
- `pnpm i18n:extract` marca a linha do catálogo `"plural": true`. `pnpm i18n:translate:ui` preenche formulários CLDR e escreve `src/locales/en-GB.json` (apenas chaves de plural).
- `src/i18n.ts` e `src/lib/i18n-server.ts` carregam esse arquivo como `sourcePluralFlatBundle` para que singular/plural em inglês se resolvam em tempo de execução.

## Modelos de notificação padrão {/* #default-notification-templates */}

Configurações → Modelos → **Redefinir** carrega padrões de `src/locales/templates/{locale}.json` (conectado em `src/lib/default-notification-templates.ts`).

1. Edite **`src/locales/templates/en-GB.json`** apenas (origem em inglês).
2. Execute **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) da raiz do repositório.
3. Revise diffs — espaços reservados como `{backup_name}` e `{problem_table}` devem permanecer inalterados; `priority` e `tags` são ignorados por `keyPolicy` em `ai-i18n-tools.config.json`.
4. Execute **`pnpm i18n:status`** para ver cobertura de bloco JSON.

Consulte o [guia JSON ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) para sinalizadores (`--locale`, `--force`, etc.).

## Glossário {/* #glossary */}

- **Terminologia da IU** para documentação é orientada por `glossary.uiGlossary` em `ai-i18n-tools.config.json`, apontando para `src/locales/strings.json` (o catálogo produzido por `pnpm i18n:extract`).
- **Substituições** ficam em `documentation/glossary-user.csv` (`glossary.userGlossary` na configuração). Consulte a [documentação de glossário do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para o formato de coluna.
- Gerar um modelo CSV: `pnpm i18n:glossary-generate` (raiz).

## Cache {/* #cache */}

O cache de tradução para ai-i18n-tools fica em `.translation-cache/` na raiz do repositório (`cacheDir` em `ai-i18n-tools.config.json`). Ele é ignorado pelo git. Use `pnpm i18n:status` e os sinalizadores `--force` / cache da CLI conforme a [documentação do ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) quando você precisar de uma atualização completa.

## IDs de cabeçalho e âncoras {/* #heading-ids-and-anchors */}

Use IDs explícitos para que os links permaneçam estáveis entre idiomas. Prefira a sintaxe de comentário MDX (`pnpm write-heading-ids` usa `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Coloque IDs em `h2` e abaixo. O Docusaurus `write-heading-ids` pula `h1` (o título da página/barra lateral). `documentation/docusaurus.config.ts` também remove comentários de ID de cabeçalho de títulos inferidos, porque a extração de metadados do Docusaurus ainda remove apenas `{#id}` clássico.

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de ignorar {/* #ignore-lists */}

Use `.translate-ignore` na raiz do repositório (mesma ideia que `.gitignore`) para caminhos que o tradutor de documentação deve pular, se você adicionar um para seu fluxo de trabalho.

## JSON do tema Docusaurus {/* #docusaurus-theme-json */}

`pnpm write-translations` extrai strings da IU do Docusaurus em `documentation/i18n/en/`. A etapa **ai-i18n-tools** `translate-docs` (com `markdownOutput.style: "docusaurus"`) preenche JSON traduzido em cada localidade ao lado do markdown, conforme `ai-i18n-tools.config.json`.

## Solução de problemas {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **não definido** — exporte-o ou adicione a `.env.local` na raiz do repositório.
- **Modelo / qualidade** — ajuste `openrouter.translationModels` e opções relacionadas em `ai-i18n-tools.config.json`.
- **Glossário** — edite `documentation/glossary-user.csv` ou regenere strings da IU e execute novamente extração + tradução.

## Adicionando um novo idioma {/* #adding-a-new-language */}

1. Adicione a localidade ao Docusaurus `i18n.locales` e `localeConfigs` em `documentation/docusaurus.config.ts`.
2. Adicione a mesma localidade a `targetLocales` em `ai-i18n-tools.config.json` (raiz do repositório).
3. Execute `pnpm i18n:generate-ui-languages` na raiz, depois `pnpm i18n:extract` / comandos de tradução conforme necessário.

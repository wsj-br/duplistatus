# 翻译维护工作流程 {/* #translation-maintenance-workflow */}

有关一般文档命令（构建、部署、截图、README 生成），请参阅 [文档工具](documentation-tools.md)。

## 概述 {/* #overview */}

文档使用 Docusaurus i18n，英语为默认语言环境。源文档位于 `docs/`；翻译文档位于 `i18n/{locale}/`。支持的语言环境：en-GB（默认）、fr、de、es、pt-BR、hi、zh-Hans。

**AI 翻译** 用于应用程序 UI、Docusaurus markdown/JSON、SVG 资源和 **默认通知模板**，由 [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) 从 **仓库根目录** 处理，配置文件位于 `ai-i18n-tools.config.json`（不在 `documentation/` 内）。运行翻译命令时，设置 `OPENROUTER_API_KEY`。

## 当英语文档发生变化时 {/* #when-english-documentation-changes */}

1. 在 `documentation/docs/` 中 **编辑源文件**（仅限英文）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如果需要，请在 `documentation/` 中运行 `pnpm write-translations`，以便 `i18n/en/*.json` 获取新键。
3. **标题 ID**：`pnpm write-heading-ids`（来自 `documentation/`）。
4. 从 **仓库根目录** **进行翻译**（或从 `documentation/` 使用下方的快捷方式）：
   - `pnpm i18n:extract` — 从 Next.js 应用程序中的 `src/locales/strings.json` 刷新 `t('…')`。
   - `pnpm i18n:translate:docs` — 将 markdown/JSON 翻译为 `documentation/i18n/` 根据配置。
   - `pnpm i18n:translate:svg` — 根据配置翻译 `documentation/static/img` 下的 SVGs。
   - `pnpm i18n:translate:json` — 从 `src/locales/templates/` 翻译默认通知模板 `en-GB.json`。
   - 或者运行所有：`pnpm i18n:translate`。
5. **构建**：`cd documentation && pnpm build`（所有语言环境）。

在 `documentation/` 内部，相同的流程被连接为 `pnpm translate` → 根目录 `i18n:translate`，加上 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync`。

## UI 复数 {/* #ui-plurals */}

Next.js 应用程序中的基数复数使用 **ai-i18n-tools**，而不是手动编写的 `_one` / `_other` 键。

编写一个英语源字符串（通常是复数）并传递一个 **普通对象字面量**，其中包含 `plurals: true` 和一个数字 `count`：

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

规则：

- 不要使用 `item(s)` 修饰语或 `count === 1 ? t('…') : t('…')` 对。
- 独立的 **数字** 计数需要单独的 `t()` 调用 — 一个复数轴不能灵活地处理两个数字（例如 1 成功和 2 失败）。连接片段：

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- 非数字插值（名称、标签等）在同一个复数字符串中与 `{{count}}` 一起使用是可以的。
- `pnpm i18n:extract` 标记目录行 `"plural": true`。 `pnpm i18n:translate:ui` 填充 CLDR 表单并写入 `src/locales/en-GB.json`（仅复数键）。
- `src/i18n.ts` 和 `src/lib/i18n-server.ts` 将该文件加载为 `sourcePluralFlatBundle`，以便英语单数/复数在运行时解析。

## 默认通知模板 {/* #default-notification-templates */}

设置 → 模板 → **重置** 从 `src/locales/templates/{locale}.json` 加载默认值（在 `src/lib/default-notification-templates.ts` 中配置）。

1. 仅编辑 **`src/locales/templates/en-GB.json`**（英语源文件）。
2. 从仓库根目录运行 **`pnpm i18n:translate:json`**（或 **`pnpm i18n:translate`**）。
3. 查看差异 — 占位符如 `{backup_name}` 和 `{problem_table}` 必须保持不变；`priority` 和 `tags` 被 `keyPolicy` 在 `ai-i18n-tools.config.json` 中跳过。
4. 运行 **`pnpm i18n:status`** 查看 JSON 块覆盖范围。

有关 [ai-i18n-tools JSON 指南](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) 中的标志（`--locale`、`--force` 等）。

## 术语表 {/* #glossary */}

- **用户界面术语**用于文档，由 `glossary.uiGlossary` 在 `ai-i18n-tools.config.json` 中驱动，指向 `src/locales/strings.json`（由 `pnpm i18n:extract` 生成的目录）。
- **覆盖** 存在于 `documentation/glossary-user.csv`（配置中的 `glossary.userGlossary`）。有关列格式，请参见 [ai-i18n-tools 术语文档](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md)。
- 生成一个 CSV 模板：`pnpm i18n:glossary-generate`（根）。

## 缓存 {/* #cache */}

ai-i18n-tools 的翻译缓存位于仓库根目录下的 `.translation-cache/` (`cacheDir` 在 `ai-i18n-tools.config.json` 中)。它被 git 忽略。使用 `pnpm i18n:status` 和 CLI 的 `--force` / 缓存标志，参考 [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) 文档，当你需要完全刷新时。

## 标题 ID 和锚点 {/* #heading-ids-and-anchors */}

使用显式 ID 使链接在语言间保持稳定。优先使用 MDX 注释语法 (`pnpm write-heading-ids` 使用 `--syntax mdx-comment`)：

```markdown
## This is a heading {/* #this-is-a-heading */}
```

将 ID 放在 `h2` 和以下位置。Docusaurus `write-heading-ids` 跳过 `h1` (页面/侧边栏标题)。`documentation/docusaurus.config.ts` 也会从推断的标题中剥离 heading-id 注释，因为 Docusaurus 元数据提取仍然只移除经典 `{#id}`。

```bash
cd documentation
pnpm write-heading-ids
```

## 忽略列表 {/* #ignore-lists */}

在仓库根目录使用 `.translate-ignore` (与 `.gitignore` 相同的概念)，为文档翻译器应跳过的路径添加一个，如果你为你的工作流添加一个。

## Docusaurus 主题 JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` 将 Docusaurus UI 字符串提取到 `documentation/i18n/en/` 中。**ai-i18n-tools** `translate-docs` 步骤 (使用 `markdownOutput.style: "docusaurus"`) 在每个语言环境下方填充翻译后的 JSON，与 markdown 一起，参考 `ai-i18n-tools.config.json`。

## 故障排除 {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **未设置** — 导出它或在仓库根目录添加到 `.env.local`。
- **模型/质量** — 调整 `openrouter.translationModels` 和相关选项在 `ai-i18n-tools.config.json` 中。
- **术语表** — 编辑 `documentation/glossary-user.csv` 或重新生成 UI 字符串并重新运行提取 + 翻译。

## 添加新语言 {/* #adding-a-new-language */}

1. 在 Docusaurus `i18n.locales` 和 `localeConfigs` 中添加语言环境，在 `documentation/docusaurus.config.ts` 中。
2. 在仓库根目录的 `targetLocales` 中添加相同的语言环境，在 `ai-i18n-tools.config.json` 中。
3. 在根目录运行 `pnpm i18n:generate-ui-languages`，然后根据需要运行 `pnpm i18n:extract` / 翻译命令。

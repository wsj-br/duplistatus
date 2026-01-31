---
translation_last_updated: '2026-01-31T00:51:29.422Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: d1761516332c96f7
translation_language: pt-BR
source_file_path: installation/environment-variables.md
---
# Variáveis de Ambiente {#environment-variables}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                            | Padrão         |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Porta para a aplicação web principal                      | `9666`          |
| `CRON_PORT`               | Porta para o serviço cron. Se não definido, usa `PORT + 1` | `9667`          |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)    | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Desativar telemetria Next.js                              | `1`             |
| `TZ`                      | Fuso horário para a aplicação                           | `Europe/London` |
| `LANG`                    | Localidade para a aplicação (ex: `en_US`, `pt_BR`)    | `en_GB`         |
| `PWD_ENFORCE`             | Defina como `false` para desativar requisitos de complexidade de senha (maiúsculas, minúsculas, números). O comprimento mínimo é sempre aplicado. | Aplicado (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres                 | `8`             |

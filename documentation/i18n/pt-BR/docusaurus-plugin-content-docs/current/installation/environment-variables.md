---
translation_last_updated: '2026-02-15T20:57:44.300Z'
source_file_mtime: '2026-02-15T18:21:42.048Z'
source_file_hash: 73f503de6e910445
translation_language: pt-BR
source_file_path: installation/environment-variables.md
---
# Variáveis de Ambiente {#environment-variables}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para a aplicação web principal                                                           | `9666`                     |
| `CRON_PORT`               | Porta para o serviço cron (agendamento). Se não definido, usa `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativar telemetria do Next.js                                                                   | `1`                        |
| `TZ`                      | Fuso horário para a aplicação                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar requisitos de complexidade de senha (maiúsculas, minúsculas, números). | Obrigatório (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres  (sempre obrigatório)                                    | `8`                        |

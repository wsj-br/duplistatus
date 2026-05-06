---
translation_last_updated: '2026-05-06T23:20:12.850Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 781281113de4e41e8ca020c5d122aaa0d1fe40599ea1612477312ced4f7eb83a
translation_language: pt-BR
source_file_path: documentation/docs/installation/environment-variables.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Variáveis de Ambiente {#environment-variables}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para a aplicação web principal                                                        | `9666`                     |
| `CRON_PORT`               | Porta para o serviço de cron (agendamento). Se não definida, usa `PORT + 1`                                  | `9667`                     |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativa a telemetria do Next.js                                                                   | `1`                        |
| `TZ`                      | Fuso horário da aplicação                                                                     | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar os requisitos de complexidade de senha (maiúsculas, minúsculas, números). | Aplicado (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres (sempre aplicado)                                   | `8`                        |

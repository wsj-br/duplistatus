# Variáveis de Ambiente {#environment-variables}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para a aplicação web principal                                                        | `9666`                     |
| `CRON_PORT`               | Porta para o serviço de cron (agendamento). Se não definida, usa `PORT + 1`                                  | `9667`                     |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativar telemetria do Next.js (definido em todos os scripts do Next.js e no Docker)                        | `1`                        |
| `TZ`                      | Fuso horário da aplicação                                                                     | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar os requisitos de complexidade de senha (maiúsculas, minúsculas, números). | Aplicado (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres (sempre aplicado)                                   | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` é definido pela imagem Docker e por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, e `pnpm dev`, então o Next.js não coleta telemetria anônima da CLI. Para persistir a opção de saída na configuração do usuário, execute `npx next telemetry disable`.

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

# Variáveis de Ambiente {/* #environment-variables */}

O aplicativo suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para o aplicativo web principal                                                           | `9666`                     |
| `CRON_PORT`               | Porta para o serviço cron (agendamento). Se não definido, usa `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Endereço que o serviço cron escuta. O loopback é o padrão, então a API de controle não é exposta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Segredo compartilhado necessário para modificar rotas do serviço cron quando o serviço não está vinculado ao loopback. O proxy do Next.js o encaminha como `X-Cron-Service-Secret`. | não definido (necessário se não for loopback) |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativar a telemetria do Next.js (definido em todos os scripts do Next.js e no Docker)                        | `1`                        |
| `TZ`                      | Fuso horário para o aplicativo                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar os requisitos de complexidade da senha (maiúsculas, minúsculas, números). | Imposto (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres  (sempre imposto)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por vírgula de proxies reversos permitidos para definir `X-Forwarded-For`                   | não definido                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Substituir a flag de habilitação da lista de permissões de IP do administrador (`true` / `false`)                           | não definido (use Configurações)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por vírgula para a interface de administração                                               | não definido                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Substituir a flag de habilitação da lista de permissões da API externa (`true` / `false`)                | não definido (use Configurações)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por vírgula para `/api/upload`, `/api/summary` e `/api/lastbackup*`           | não definido                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base pública da interface web do duplistatus (sem barra no final). Quando definido, substitui Configurações → Resumo Diário **URL do painel público** e os e-mails do Resumo Diário incluem `{duplistatus_link}`. Quando não definido, a configuração salva é usada; se isso também estiver vazio, nenhum link do painel é adicionado. | não definido                      |

`NEXT_TELEMETRY_DISABLED=1` é definido pela imagem Docker e por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` e `pnpm dev`, então o Next.js não coleta telemetria CLI anônima. Quando usar um novo ambiente de desenvolvimento ou compilar a partir da fonte, persista a opção de saída no seu arquivo de configuração do usuário, execute `npx next telemetry disable`.

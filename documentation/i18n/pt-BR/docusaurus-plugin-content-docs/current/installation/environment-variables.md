# Variáveis de Ambiente {#environment-variables}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para a aplicação web principal                                                        | `9666`                     |
| `CRON_PORT`               | Porta para o serviço de cron (agendamento). Se não definida, usa `PORT + 1`                                  | `9667`                     |
| `CRON_BIND_HOST`          | Endereço no qual o serviço cron escuta. O loopback é o padrão, então a API de controle não é exposta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Segredo compartilhado necessário para mutar rotas do serviço cron quando o serviço não está vinculado ao loopback. O proxy Next.js o encaminha como `X-Cron-Service-Secret`. | não definido (obrigatório se não for loopback) |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativar telemetria do Next.js (definido em todos os scripts do Next.js e no Docker)                        | `1`                        |
| `TZ`                      | Fuso horário da aplicação                                                                     | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar os requisitos de complexidade de senha (maiúsculas, minúsculas, números). | Aplicado (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo da senha em caracteres (sempre aplicado)                                   | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por vírgulas de proxies reversos permitidos para definir `X-Forwarded-For`                   | unset                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Substituir a bandeira de ativação da lista de permissões de IP do administrador (`true` / `false`)                           | unset (use Configurações)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por vírgulas para a interface de administração                                               | unset                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Substituir a bandeira de ativação da lista de permissões de IP da API externa (`true` / `false`)                | unset (use Configurações)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por vírgulas para `/api/upload`, `/api/summary`, e `/api/lastbackup*`           | unset                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base público da interface web do duplistatus (sem barra no final). {{When}} definido, substitui Configurações → Resumo Diário **URL do painel público** e os e-mails do Resumo Diário incluem `{duplistatus_link}`. {{When}} não definido, a configuração salva é utilizada; se essa também estiver vazia, nenhum link do painel é adicionado. | unset                      |

`NEXT_TELEMETRY_DISABLED=1` é definido pela imagem Docker e por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, e `pnpm dev`, então o Next.js não coleta telemetria anônima da CLI. Para persistir a opção de saída na configuração do usuário, execute `npx next telemetry disable`.

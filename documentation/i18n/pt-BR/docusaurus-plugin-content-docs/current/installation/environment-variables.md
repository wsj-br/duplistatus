# Variáveis de Ambiente {/* #environment-variables */}

A aplicação suporta as seguintes variáveis de ambiente para configuração:

| Variável                  | Descrição                                                                                 | Padrão                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Porta para a aplicação web principal                                                           | `9666`                     |
| `CRON_PORT`               | Porta para o serviço cron (agendamento). Se não definido, usa `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Endereço no qual o serviço cron escuta. O loopback é o padrão para que a API de controle não seja exposta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Segredo compartilhado necessário para rotas de mutação do serviço cron quando o serviço não está vinculado ao loopback. O proxy Next.js o encaminha como `X-Cron-Service-Secret`. | não definido (obrigatório se não for loopback) |
| `NODE_ENV`                | Ambiente Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desativar telemetria Next.js (definido em todos os scripts Next.js e no Docker)                        | `1`                        |
| `TZ`                      | Fuso horário para a aplicação                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Defina como `false` para desativar requisitos de complexidade de senha (maiúsculas, minúsculas, números). | Obrigatório (validação completa) |
| `PWD_MIN_LEN`             | Comprimento mínimo de senha em caracteres (sempre obrigatório)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por vírgula de proxies reversos permitidos para definir `X-Forwarded-For`                   | não definido                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Substituir o sinalizador de ativação da lista de permissões de IP do administrador (`true` / `false`)                           | não definido (usar Configurações)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por vírgula para a interface de administração                                               | não definido                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Substituir o sinalizador de ativação da lista de permissões de API externa (`true` / `false`)                | não definido (usar Configurações)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por vírgula para `/api/upload`, `/api/summary` e `/api/lastbackup*`           | não definido                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base pública da interface do duplistatus (sem barra à direita). Quando definido, substitui Configurações → Resumo Diário **URL do painel público** e os emails do Resumo Diário incluem `{duplistatus_link}`. Quando não definido, a configuração salva é usada; se também estiver vazia, nenhum link do painel é adicionado. | não definido                      |

`NEXT_TELEMETRY_DISABLED=1` é definido pela imagem Docker e por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` e `pnpm dev`, portanto Next.js não coleta telemetria anônima da CLI. Ao usar um novo ambiente de desenvolvimento ou compilar a partir do código-fonte, também persista a recusa na sua configuração de usuário, execute `npx next telemetry disable`.
